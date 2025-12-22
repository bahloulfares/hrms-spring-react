package com.fares.gestionrh.dto.utilisateur;
import com.fares.gestionrh.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilisateurDTO {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String nomComplet;
    private String telephone;
    private String poste;
    private String departement;
    private Set<Role> roles;
    private Boolean actif;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
}