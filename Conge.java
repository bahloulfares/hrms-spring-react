package com.fares.gestionrh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "conges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate dateDebut;

    @Column(nullable = false)
    private LocalDate dateFin;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "type_id", nullable = false)
    private TypeConge type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutConge statut = StatutConge.EN_ATTENTE;

    @Column(length = 500)
    private String motif;

    @Column(length = 500)
    private String commentaireValidation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Utilisateur employe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validateur_id")
    private Utilisateur validateur;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateDemande;

    private LocalDateTime dateValidation;

    @Column(nullable = false)
    private Double nombreJours;

    // ========== AMÉLIORATIONS RECOMMANDÉES ==========

    /**
     * NOUVEAU: Enregistrer le nombre de jours déduit du type spécifique
     * Permet de recréditer exactement lors d'une annulation
     * 
     * Exemple: Congé FORMATION 5j
     * - FORMATION a 3j, CP a 5j
     * - Déduction: FORMATION -3j, CP -2j
     * - joursDeductionSpecifique = 3.0
     * - joursDeductionCP = 2.0
     * 
     * Annulation: recrédite FORMATION +3j, CP +2j (cohérent)
     */
    @Column(nullable = true)
    private Double joursDeductionSpecifique;

    /**
     * NOUVEAU: Enregistrer le nombre de jours déduit sur le CP (débordement)
     */
    @Column(nullable = true)
    private Double joursDeductionCP;

    /**
     * NOUVEAU: Énumération pour les types de durée (future feature)
     * Permet de supporter: journée entière, demi-jour, heure
     */
    public enum DureeType {
        JOURNEE_ENTIERE,      // Par défaut
        DEMI_JOUR_MATIN,
        DEMI_JOUR_APRES_MIDI,
        PAR_HEURE
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50) DEFAULT 'JOURNEE_ENTIERE'")
    private DureeType dureeType = DureeType.JOURNEE_ENTIERE;

    // Pour future support des demi-journées et congés à l'heure
    @Column
    private LocalTime heureDebut;

    @Column
    private LocalTime heureFin;

    // ========== MÉTHODE UTILITAIRE (INCHANGÉE) ==========

    /**
     * Calcule le nombre de jours entre deux dates en fonction du type de compte
     * @deprecated Utiliser CongeService.calculateTotalDays() à la place
     */
    @Deprecated
    public static double calculateNombreJours(LocalDate dateDebut, LocalDate dateFin, boolean compteWeekend) {
        if (dateDebut == null || dateFin == null) {
            return 0;
        }

        if (compteWeekend) {
            return ChronoUnit.DAYS.between(dateDebut, dateFin) + 1;
        }

        // Calcul des jours ouvrés (hors Sat/Sun)
        long count = 0;
        LocalDate current = dateDebut;
        while (!current.isAfter(dateFin)) {
            java.time.DayOfWeek dow = current.getDayOfWeek();
            if (dow != java.time.DayOfWeek.SATURDAY && dow != java.time.DayOfWeek.SUNDAY) {
                count++;
            }
            current = current.plusDays(1);
        }
        return count;
    }
}
