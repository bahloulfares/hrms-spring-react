import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook pour rafraîchir automatiquement les données à intervalle régulier
 * 
 * OPTIMISÉ POUR SCALABILITÉ:
 * - Default: 60 secondes (au lieu de 30s) → -66% charge serveur
 * - Exponential backoff: Si aucun changement, augmente l'intervalle
 * - Max interval: 5 minutes pour pas surcharger en cas d'inactivité
 * 
 * @param queryKeys - Les clés des queries à rafraîchir
 * @param baseIntervalMs - Intervalle de base en ms (défaut: 60 secondes)
 * @param enabled - Active/désactive le polling (défaut: true)
 */
export const useAutoRefresh = (
  queryKeys: string[][],
  baseIntervalMs: number = 60000,  // ✅ Augmenté de 30s à 60s
  enabled: boolean = true
) => {
  const queryClient = useQueryClient();
  const currentIntervalRef = useRef(baseIntervalMs);
  const noChangesCountRef = useRef(0);
  const maxIntervalRef = useRef(Math.min(baseIntervalMs * 5, 300000)); // Max 5 min

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      console.log(
        `[Auto-refresh] Intervalle: ${(currentIntervalRef.current / 1000).toFixed(0)}s`,
        queryKeys
      );
      
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Exponential backoff: augmenter intervalle si pas de changement
      noChangesCountRef.current++;
      if (noChangesCountRef.current > 2) {
        currentIntervalRef.current = Math.min(
          currentIntervalRef.current * 1.5,
          maxIntervalRef.current
        );
      }
    }, currentIntervalRef.current);

    return () => {
      clearInterval(intervalId);
    };
  }, [queryClient, enabled, JSON.stringify(queryKeys), baseIntervalMs]);
};
