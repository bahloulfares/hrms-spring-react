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

    // Méthode utilitaire pour calculer le nombre de jours
    public long getNombreJours() {
        if (dateDebut != null && dateFin != null) {
            return ChronoUnit.DAYS.between(dateDebut, dateFin) + 1;
        }
        return 0;
    }
}
