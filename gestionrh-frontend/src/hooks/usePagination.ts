/**
 * usePagination - Hook pour gérer la pagination côté client
 * 
 * Gère:
 * - Page courante
 * - Taille de page
 * - Tri
 * - Intégration React Query
 * 
 * @example
 * const pagination = usePagination({ pageSize: 10 });
 * const { data, isLoading } = useQuery({
 *   queryKey: ['employees', pagination.queryParams],
 *   queryFn: () => getEmployees(pagination.queryParams),
 * });
 */

import { useState, useCallback } from 'react';

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginationState extends PaginationParams {
  totalElements: number;
  totalPages: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  initialSort?: string;
  initialDirection?: 'asc' | 'desc';
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    initialPage = 0,
    pageSize = 10,
    initialSort,
    initialDirection = 'asc',
  } = options;

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(pageSize);
  const [sort, setSort] = useState(initialSort);
  const [direction, setDirection] = useState(initialDirection);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Réinitialiser à page 0 quand la taille change
  const handlePageSizeChange = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  // Aller à une page spécifique
  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  }, [totalPages]);

  // Aller à la page suivante
  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  // Aller à la page précédente
  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  // Ajouter/changer le tri
  const handleSort = useCallback((sortField: string) => {
    if (sort === sortField) {
      // Inverser la direction si on clique sur le même champ
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau champ de tri
      setSort(sortField);
      setDirection('asc');
    }
    // Réinitialiser à la page 0
    setPage(0);
  }, [sort, direction]);

  // Réinitialiser la pagination
  const reset = useCallback(() => {
    setPage(initialPage);
    setSize(pageSize);
    setSort(initialSort);
    setDirection(initialDirection);
  }, [initialPage, pageSize, initialSort, initialDirection]);

  // Paramètres pour la requête API
  const queryParams: PaginationParams = {
    page,
    size,
    ...(sort && { sort }),
    ...(direction && { direction }),
  };

  // Mettre à jour le total (appelé après recevoir la réponse API)
  const setTotal = useCallback(
    (total: number, pages: number) => {
      setTotalElements(total);
      setTotalPages(pages);
    },
    []
  );

  // Calculer les informations de pagination
  const startRecord = page * size + 1;
  const endRecord = Math.min((page + 1) * size, totalElements);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return {
    // État
    page,
    size,
    sort,
    direction,
    totalElements,
    totalPages,
    
    // Contrôles
    goToPage,
    nextPage,
    prevPage,
    handlePageSizeChange,
    handleSort,
    reset,
    setTotal,
    
    // Paramètres API
    queryParams,
    
    // Informations de display
    startRecord,
    endRecord,
    hasNextPage,
    hasPrevPage,
    isEmpty: totalElements === 0,
  };
}

export type UsePaginationReturn = ReturnType<typeof usePagination>;
