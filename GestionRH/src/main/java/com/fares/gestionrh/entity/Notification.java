package com.fares.gestionrh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(nullable = false, length = 50)
    private String type; // LEAVE_CREATED, LEAVE_APPROVED, LEAVE_REJECTED, LEAVE_CANCELLED

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private Boolean lue = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conge_id")
    private Conge conge;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    // Données dénormalisées pour affichage rapide (évite les jointures)
    @Column(name = "employe_nom")
    private String employeNom;

    @Column(name = "type_conge")
    private String typeConge;

    @Column(name = "action_par")
    private String actionPar; // Nom de la personne qui a effectué l'action (pour validation)
}
