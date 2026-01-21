/**
 * PaginationControls - Composant de contrôle de pagination
 * 
 * Affiche:
 * - Numéros de pages
 * - Boutons prev/next
 * - Sélection de taille de page
 * - Info "X to Y of Z"
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button/Button';
import { Select } from './ui/Select/Select';
import type { UsePaginationReturn } from '@/hooks/usePagination';

interface PaginationControlsProps {
  pagination: UsePaginationReturn;
  pageSizes?: number[];
}

export function PaginationControls({
  pagination,
  pageSizes = [5, 10, 25, 50],
}: PaginationControlsProps) {
  const {
    page,
    size,
    totalElements,
    totalPages,
    startRecord,
    endRecord,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    handlePageSizeChange,
  } = pagination;

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Afficher toutes les pages si peu de pages
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Afficher première, dernière, et pages autour de la courante
      pages.push(0);

      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);

      if (start > 1) pages.push('...');
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 2) pages.push('...');

      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      {/* Info texte */}
      <div className="text-sm text-slate-600">
        {totalElements === 0 ? (
          <span>Aucun résultat</span>
        ) : (
          <>
            Affichage <span className="font-semibold">{startRecord}</span> à{' '}
            <span className="font-semibold">{endRecord}</span> sur{' '}
            <span className="font-semibold">{totalElements}</span> résultats
          </>
        )}
      </div>

      {/* Contrôles pagination */}
      <div className="flex items-center gap-2">
        {/* Bouton précédent */}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={prevPage}
          aria-label="Page précédente"
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Précédent
        </Button>

        {/* Numéros de pages */}
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((pageNum, idx) =>
            pageNum === '...' ? (
              <span key={`dots-${idx}`} className="px-2 text-slate-500">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum as number)}
                className={`px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${
                  page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                aria-current={page === pageNum ? 'page' : undefined}
              >
                {(pageNum as number) + 1}
              </button>
            )
          )}
        </div>

        {/* Bouton suivant */}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={nextPage}
          aria-label="Page suivante"
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Suivant
        </Button>
      </div>

      {/* Sélection taille de page */}
      <div className="flex items-center gap-2">
        <label htmlFor="page-size" className="text-sm text-slate-600">
          Par page:
        </label>
        <Select
          id="page-size"
          value={size.toString()}
          onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
          className="w-20"
        >
          {pageSizes.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export default PaginationControls;
