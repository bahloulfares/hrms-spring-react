package com.fares.gestionrh.dto.conge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fares.gestionrh.entity.StatutConge;

import java.time.LocalDateTime;

/**
 * DTO pour exposer l'historique des changements de statut d'une demande de congé
 * Utilisé pour la traçabilité (audit trail) dans le frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CongeHistoriqueDTO {
    
    /**
     * ID unique de l'entrée historique
     */
    private Long id;
    
    /**
     * Statut avant le changement (ex: EN_ATTENTE)
     * Peut être null pour la création initiale
     */
    private StatutConge statutPrecedent;
    
    /**
     * Statut après le changement (ex: APPROUVE, REFUSE)
     */
    private StatutConge statutNouveau;
    
    /**
     * Email de l'utilisateur qui a effectué l'action
     */
    private String acteur;
    
    /**
     * Nom complet de l'utilisateur (ex: "Jean Dupont")
     */
    private String acteurNom;
    
    /**
     * Date et heure du changement
     */
    private LocalDateTime dateModification;
    
    /**
     * Raison du changement (optionnel)
     * Utilisé pour les refus: "Solde insuffisant", "Période critique"
     * Utilisé pour les approbations: "Approuvé. Bon repos!"
     */
    private String commentaire;
}
