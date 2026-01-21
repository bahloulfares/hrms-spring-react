import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type Orientation = 'portrait' | 'landscape';

type ExportColumn<T> = {
  header: string;
  accessor?: keyof T;
  formatter?: (row: T) => string | number | null | undefined;
};

interface ExportOptions<T> {
  title: string;
  columns: ExportColumn<T>[];
  data: T[];
  fileName?: string;
  orientation?: Orientation;
  meta?: Array<{ label: string; value: string }>; // optional metadata lines
}

const normalizeValue = (value: unknown): string | number => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.toLocaleString();
  return String(value);
};

export function exportToPdf<T>(options: ExportOptions<T>): void {
  const { title, columns, data, fileName, orientation = 'landscape', meta } = options;
  if (!data || data.length === 0) return;

  const doc = new jsPDF({ orientation });
  doc.setFontSize(14);
  doc.text(title, 14, 18);

  if (meta && meta.length > 0) {
    doc.setFontSize(10);
    meta.forEach((item, index) => {
      doc.text(`${item.label}: ${item.value}`, 14, 26 + index * 6);
    });
  }

  const rows = data.map((row) =>
    columns.map((col) =>
      normalizeValue(col.formatter ? col.formatter(row) : col.accessor ? (row as any)[col.accessor] : '')
    )
  );

  autoTable(doc, {
    head: [columns.map((col) => col.header)],
    body: rows,
    startY: meta && meta.length > 0 ? 26 + meta.length * 6 : 22,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: 'striped',
  });

  doc.save(`${fileName || title}.pdf`);
}

export function exportToExcel<T>(options: ExportOptions<T>): void {
  const { title, columns, data, fileName } = options;
  if (!data || data.length === 0) return;

  const worksheetData = [columns.map((col) => col.header)];

  data.forEach((row) => {
    worksheetData.push(
      columns.map((col) => String(normalizeValue(col.formatter ? col.formatter(row) : col.accessor ? (row as any)[col.accessor] : '')))
    );
  });

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');

  XLSX.writeFile(workbook, `${fileName || title}.xlsx`);
}
