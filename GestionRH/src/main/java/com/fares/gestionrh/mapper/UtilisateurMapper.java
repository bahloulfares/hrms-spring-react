package com.fares.gestionrh.mapper;

import com.fares.gestionrh.dto.auth.RegisterRequest;
import com.fares.gestionrh.dto.utilisateur.CreateUtilisateurRequest;
import com.fares.gestionrh.dto.utilisateur.UpdateUtilisateurRequest;
import com.fares.gestionrh.dto.utilisateur.UtilisateurDTO;
import com.fares.gestionrh.entity.Role;
import com.fares.gestionrh.entity.Utilisateur;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class UtilisateurMapper {

    private final com.fares.gestionrh.repository.PosteRepository posteRepository;
    private final com.fares.gestionrh.repository.DepartementRepository departementRepository;

    /**
     * Convertit une entité Utilisateur en DTO
     * ⚠️ Ne retourne JAMAIS le mot de passe
     */
    public UtilisateurDTO toDTO(Utilisateur utilisateur) {
        if (utilisateur == null) {
            return null;
        }
        return UtilisateurDTO.builder()
                .id(utilisateur.getId())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .nomComplet(utilisateur.getNomComplet())
                .telephone(utilisateur.getTelephone())
                .poste(utilisateur.getPoste() != null ? utilisateur.getPoste().getTitre() : null)
                .departement(utilisateur.getDepartement() != null ? utilisateur.getDepartement().getNom() : null)
                .roles(utilisateur.getRoles())
                .actif(utilisateur.getActif())
                .dateCreation(utilisateur.getDateCreation())
                .dateModification(utilisateur.getDateModification())
                .build();
    }

    /**
     * Convertit un CreateUtilisateurRequest en entité
     * ⚠️ Le mot de passe doit être encodé APRÈS cette conversion
     */
    public Utilisateur toEntity(CreateUtilisateurRequest request) {
        if (request == null) {
            return null;
        }

        Utilisateur.UtilisateurBuilder builder = Utilisateur.builder()
                .email(request.getEmail())
                .motDePasse(request.getMotDePasse()) // Sera encodé dans le service
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .telephone(request.getTelephone())
                .roles(request.getRoles() != null ? request.getRoles() : getDefaultRoles())
                .actif(request.getActif() != null ? request.getActif() : true);

        if (request.getPoste() != null) {
            posteRepository.findByTitre(request.getPoste())
                    .ifPresent(builder::poste);
        }

        if (request.getDepartement() != null) {
            departementRepository.findByNom(request.getDepartement())
                    .ifPresent(builder::departement);
        }

        return builder.build();
    }

    /**
     * Convertit un RegisterRequest en entité
     * ⚠️ Le mot de passe doit être encodé APRÈS cette conversion
     */
    public Utilisateur toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }

        Utilisateur.UtilisateurBuilder builder = Utilisateur.builder()
                .email(request.getEmail())
                .motDePasse(request.getMotDePasse())
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .telephone(request.getTelephone())
                .roles(request.getRoles() != null ? request.getRoles() : getDefaultRoles())
                .actif(true);

        if (request.getPoste() != null) {
            posteRepository.findByTitre(request.getPoste()).ifPresent(builder::poste);
        }

        if (request.getDepartement() != null) {
            departementRepository.findByNom(request.getDepartement()).ifPresent(builder::departement);
        }

        return builder.build();
    }

    /**
     * Met à jour une entité existante avec les données d'un
     * UpdateUtilisateurRequest
     * ⚠️ Ne met à jour que les champs non-null
     */
    public void updateEntity(Utilisateur utilisateur, UpdateUtilisateurRequest request) {
        if (utilisateur == null || request == null) {
            return;
        }
        if (request.getEmail() != null) {
            utilisateur.setEmail(request.getEmail());
        }
        if (request.getNom() != null) {
            utilisateur.setNom(request.getNom());
        }
        if (request.getPrenom() != null) {
            utilisateur.setPrenom(request.getPrenom());
        }
        if (request.getTelephone() != null) {
            utilisateur.setTelephone(request.getTelephone());
        }
        if (request.getPoste() != null) {
            posteRepository.findByTitre(request.getPoste()).ifPresent(utilisateur::setPoste);
        }

        if (request.getDepartement() != null) {
            departementRepository.findByNom(request.getDepartement()).ifPresent(utilisateur::setDepartement);
        }
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            utilisateur.setRoles(request.getRoles());
        }
        if (request.getActif() != null) {
            utilisateur.setActif(request.getActif());
        }
    }

    /**
     * Retourne les rôles par défaut pour un nouvel utilisateur
     */
    private Set<Role> getDefaultRoles() {
        Set<Role> roles = new HashSet<>();
        roles.add(Role.EMPLOYE);
        return roles;
    }
}