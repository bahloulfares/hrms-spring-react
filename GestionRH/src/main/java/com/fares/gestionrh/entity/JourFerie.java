package com.fares.gestionrh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Entité représentant les jours fériés tunisiens
 * Permet d'exclure ces jours du calcul des congés
 */
@Entity
@Table(name = "jours_feries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourFerie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 500)
    private String description;

    /**
     * Indique si ce jour férié est récurrent chaque année (ex: 1er Mai)
     * Si true, la date sera recalculée automatiquement pour l'année en cours
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean recurrent = false;

    /**
     * Type de jour férié selon la législation tunisienne:
     * - NATIONAL: Fête nationale (ex: 20 Mars - Fête de l'Indépendance)
     * - RELIGIEUX: Fête religieuse (ex: Aïd el-Fitr, Aïd el-Adha)
     * - CIVIL: Jour férié civil (ex: 1er Mai - Fête du Travail)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeJourFerie type;

    public enum TypeJourFerie {
        NATIONAL,
        RELIGIEUX,
        CIVIL
    }
}
