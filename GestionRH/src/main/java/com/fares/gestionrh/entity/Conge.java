package com.fares.gestionrh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    // Trace du split réel utilisé lors de la déduction (pour recrédit exact)
    @Column
    private Double joursDeductionSpecifique;

    @Column
    private Double joursDeductionCP;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "duree_type")
    @Builder.Default
    private DureeType dureeType = DureeType.JOURNEE_ENTIERE;

    @Column(name = "heure_debut")
    private LocalTime heureDebut;

    @Column(name = "heure_fin")
    private LocalTime heureFin;

    public enum DureeType {
        JOURNEE_ENTIERE,
        DEMI_JOUR_MATIN,
        DEMI_JOUR_APRES_MIDI,
        PAR_HEURE
    }

    // Méthode utilitaire pour calculer le nombre de jours (utilisée avant la
    // persistance)
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
