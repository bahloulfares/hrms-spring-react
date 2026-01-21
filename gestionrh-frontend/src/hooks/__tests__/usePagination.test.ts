import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.page).toBe(0);
    expect(result.current.size).toBe(10);
    expect(result.current.totalElements).toBe(0);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it('should initialize with custom page size', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 25 }));

    expect(result.current.size).toBe(25);
  });

  it('should calculate pagination values correctly', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));

    act(() => {
      result.current.setTotal(45, 5);
    });

    expect(result.current.totalElements).toBe(45);
    expect(result.current.totalPages).toBe(5);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.startRecord).toBe(1);
    expect(result.current.endRecord).toBe(10);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it('should go to next page', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));

    act(() => {
      result.current.setTotal(45, 5);
    });

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page).toBe(1);
    expect(result.current.startRecord).toBe(11);
    expect(result.current.endRecord).toBe(20);
    expect(result.current.hasPrevPage).toBe(true);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should go to previous page', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));

    act(() => {
      result.current.setTotal(45, 5);
    });

    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.page).toBe(2);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe(1);
  });

  it('should not go to next page when on last page', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));

    act(() => {
      result.current.setTotal(45, 5);
    });

    act(() => {
      result.current.goToPage(4);
    });

    expect(result.current.page).toBe(4);
    expect(result.current.hasNextPage).toBe(false);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page).toBe(4);
  });

  it('should not go to previous page when on first page', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));

    act(() => {
      result.current.setTotal(45, 5);
    });

    expect(result.current.page).toBe(0);
    expect(result.current.hasPrevPage).toBe(false);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe(0);
  });

  it('should change page size and reset to first page', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));

    act(() => {
      result.current.setTotal(100, 10);
    });

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.page).toBe(3);
    expect(result.current.size).toBe(10);

    act(() => {
      result.current.handlePageSizeChange(25);
    });

    expect(result.current.page).toBe(0);
    expect(result.current.size).toBe(25);
  });

  it('should handle sorting', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sort).toBe('name');
    expect(result.current.direction).toBe('asc');

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.direction).toBe('desc');

    act(() => {
      result.current.handleSort('email');
    });

    expect(result.current.sort).toBe('email');
    expect(result.current.direction).toBe('asc');
  });

  it('should reset pagination', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));

    act(() => {
      result.current.setTotal(100, 10);
    });

    act(() => {
      result.current.goToPage(3);
    });

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.page).toBe(0);
    expect(result.current.sort).toBe('name');

    act(() => {
      result.current.reset();
    });

    expect(result.current.page).toBe(0);
    expect(result.current.sort).toBeUndefined();
    expect(result.current.direction).toBe('asc');
  });

  it('should generate correct query params', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 20 }));

    act(() => {
      result.current.handleSort('createdAt');
    });

    const params = result.current.queryParams;

    expect(params.page).toBe(0);
    expect(params.size).toBe(20);
    expect(params.sort).toBe('createdAt');
    expect(params.direction).toBe('asc');
  });

  it('should calculate records on last page correctly', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));

    act(() => {
      result.current.setTotal(45, 5);
    });

    act(() => {
      result.current.goToPage(4);
    });

    expect(result.current.startRecord).toBe(41);
    expect(result.current.endRecord).toBe(45);
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));

    act(() => {
      result.current.setTotal(0, 0);
    });

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.startRecord).toBe(1);
    expect(result.current.endRecord).toBe(0);
  });

  it('should handle single page of data', () => {
    const { result } = renderHook(() => usePagination({ pageSize: 10 }));

    act(() => {
      result.current.setTotal(5, 1);
    });

    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.startRecord).toBe(1);
    expect(result.current.endRecord).toBe(5);
  });
});
