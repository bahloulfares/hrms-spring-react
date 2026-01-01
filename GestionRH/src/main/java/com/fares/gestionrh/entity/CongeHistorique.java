package com.fares.gestionrh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "conge_historique")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CongeHistorique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conge_id", nullable = false)
    private Conge conge;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_precedent")
    private StatutConge statutPrecedent;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_nouveau", nullable = false)
    private StatutConge statutNouveau;

    @Column(name = "acteur", nullable = false, length = 100)
    private String acteur;

    @CreationTimestamp
    @Column(name = "date_modification", nullable = false, updatable = false)
    private LocalDateTime dateModification;

    @Column(name = "commentaire", length = 500)
    private String commentaire;
}
