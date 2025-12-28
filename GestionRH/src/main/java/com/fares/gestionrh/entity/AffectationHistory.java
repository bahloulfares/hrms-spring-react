package com.fares.gestionrh.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "affectation_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AffectationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    private String oldDepartement;
    private String newDepartement;
    private String oldPoste;
    private String newPoste;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateChangement;

    private String modifiePar; // Email de la personne ayant fait la modif
}
