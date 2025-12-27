package com.fares.gestionrh.entity;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "utilisateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    @Column(nullable = false)
    private String motDePasse;
    @Column(nullable = false, length = 100)
    private String nom;
    @Column(nullable = false, length = 100)
    private String prenom;
    @Column(length = 20)
    private String telephone;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "poste_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Poste poste;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "departement_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Departement departement;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "utilisateur_roles", joinColumns = @JoinColumn(name = "utilisateur_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    @Builder.Default
    private Set<Role> roles = new HashSet<>();
    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;
    @UpdateTimestamp
    private LocalDateTime dateModification;

    // Méthode utilitaire
    public String getNomComplet() {
        return prenom + " " + nom;
    }

    // Ajouter un rôle
    public void addRole(Role role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        this.roles.add(role);
    }
}