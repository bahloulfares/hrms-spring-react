import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaginationControls } from '../PaginationControls';
import type { UsePaginationReturn } from '../../hooks/usePagination';

const createMockPagination = (overrides?: Partial<UsePaginationReturn>): UsePaginationReturn => ({
  page: 0,
  size: 10,
  sort: '',
  direction: 'asc',
  totalElements: 50,
  totalPages: 5,
  startRecord: 1,
  endRecord: 10,
  hasNextPage: true,
  hasPrevPage: false,
  isEmpty: false,
  goToPage: vi.fn(),
  nextPage: vi.fn(),
  prevPage: vi.fn(),
  handlePageSizeChange: vi.fn(),
  handleSort: vi.fn(),
  reset: vi.fn(),
  setTotal: vi.fn(),
  queryParams: { page: 0, size: 10, sort: '' },
  ...overrides,
});

describe('PaginationControls', () => {
  it('should render pagination info correctly', () => {
    const mockPagination = createMockPagination();
    
    render(<PaginationControls pagination={mockPagination} />);
    
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('50').length).toBeGreaterThan(0);
  });

  it('should render with custom page sizes', () => {
    const mockPagination = createMockPagination();
    
    render(<PaginationControls pagination={mockPagination} pageSizes={[5, 10, 25, 50]} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should call prevPage when previous button clicked', () => {
    const mockPagination = createMockPagination({ page: 2, hasPrevPage: true });
    
    render(<PaginationControls pagination={mockPagination} />);
    
    const prevButton = screen.getByLabelText(/page précédente/i);
    fireEvent.click(prevButton);
    
    expect(mockPagination.prevPage).toHaveBeenCalledTimes(1);
  });

  it('should call nextPage when next button clicked', () => {
    const mockPagination = createMockPagination({ hasNextPage: true });
    
    render(<PaginationControls pagination={mockPagination} />);
    
    const nextButton = screen.getByLabelText(/page suivante/i);
    fireEvent.click(nextButton);
    
    expect(mockPagination.nextPage).toHaveBeenCalledTimes(1);
  });

  it('should disable previous button on first page', () => {
    const mockPagination = createMockPagination({ page: 0, hasPrevPage: false });
    
    render(<PaginationControls pagination={mockPagination} />);
    
    const prevButton = screen.getByLabelText(/page précédente/i);
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    const mockPagination = createMockPagination({ 
      page: 4, 
      totalPages: 5,
      hasNextPage: false,
      startRecord: 41,
      endRecord: 50,
    });
    
    render(<PaginationControls pagination={mockPagination} />);
    
    const nextButton = screen.getByLabelText(/page suivante/i);
    expect(nextButton).toBeDisabled();
  });

  it('should call goToPage when page number clicked', () => {
    const mockPagination = createMockPagination({ totalPages: 5 });
    
    render(<PaginationControls pagination={mockPagination} />);
    
    const pageButton = screen.getByText('3');
    fireEvent.click(pageButton);
    
    expect(mockPagination.goToPage).toHaveBeenCalledWith(2); // 0-indexed
  });

  it('should highlight current page', () => {
    const mockPagination = createMockPagination({ page: 2, totalPages: 5 });
    
    render(<PaginationControls pagination={mockPagination} />);
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('bg-blue-600');
  });

  it('should call handlePageSizeChange when size changed', () => {
    const mockPagination = createMockPagination();
    
    render(<PaginationControls pagination={mockPagination} pageSizes={[10, 25, 50]} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '25' } });
    
    expect(mockPagination.handlePageSizeChange).toHaveBeenCalledWith(25);
  });

  it('should not render when data is empty', () => {
    const mockPagination = createMockPagination({ 
      isEmpty: true, 
      totalElements: 0,
      totalPages: 0,
    });
    
    render(<PaginationControls pagination={mockPagination} />);
    
    // Should still render but show "Aucun résultat"
    expect(screen.getByText(/Aucun résultat/i)).toBeInTheDocument();
  });

  it('should render ellipsis for large page ranges', () => {
    const mockPagination = createMockPagination({ 
      page: 5,
      totalPages: 20,
      startRecord: 51,
      endRecord: 60,
    });
    
    render(<PaginationControls pagination={mockPagination} />);
    
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('should show correct page range for middle pages', () => {
    const mockPagination = createMockPagination({ 
      page: 5,
      totalPages: 10,
      startRecord: 51,
      endRecord: 60,
    });
    
    render(<PaginationControls pagination={mockPagination} />);
    
    // Should show pages around current page
    const pageButtons = screen.getAllByRole('button').filter(b => !isNaN(Number(b.textContent)));
    expect(pageButtons.length).toBeGreaterThan(0);
    expect(screen.getByText('6')).toBeInTheDocument(); // current page (0-indexed + 1)
  });

  it('should display page size in select', () => {
    const mockPagination = createMockPagination({ size: 25 });
    
    render(<PaginationControls pagination={mockPagination} pageSizes={[10, 25, 50]} />);
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('25');
  });

  it('should render correctly with single page', () => {
    const mockPagination = createMockPagination({ 
      totalPages: 1,
      totalElements: 5,
      endRecord: 5,
      hasNextPage: false,
      hasPrevPage: false,
    });
    
    render(<PaginationControls pagination={mockPagination} />);
    
    // Find page button with role
    const pageButton = screen.getAllByRole('button').find(b => b.textContent === '1' && b.hasAttribute('aria-current'));
    expect(pageButton).toBeInTheDocument();
    expect(screen.getByLabelText(/page précédente/i)).toBeDisabled();
    expect(screen.getByLabelText(/page suivante/i)).toBeDisabled();
  });
});
