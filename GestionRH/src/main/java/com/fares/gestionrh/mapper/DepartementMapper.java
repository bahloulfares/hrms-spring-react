package com.fares.gestionrh.mapper;

import com.fares.gestionrh.dto.departement.CreateDepartementRequest;
import com.fares.gestionrh.dto.departement.DepartementDTO;
import com.fares.gestionrh.dto.departement.UpdateDepartementRequest;

import com.fares.gestionrh.entity.Departement;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DepartementMapper {

    private final UtilisateurRepository utilisateurRepository;

    public DepartementDTO toDTO(Departement departement) {
        if (departement == null) {
            return null;
        }
        return DepartementDTO.builder()
                .id(departement.getId())
                .nom(departement.getNom())
                .description(departement.getDescription())
                .managerId(departement.getManager() != null ? departement.getManager().getId() : null)
                .managerNom(departement.getManager() != null ? departement.getManager().getNomComplet() : null)
                .build();
    }

    public Departement toEntity(CreateDepartementRequest request) {
        if (request == null) {
            return null;
        }

        Utilisateur manager = null;
        if (request.getManagerId() != null) {
            manager = utilisateurRepository.findById(request.getManagerId()).orElse(null);
        }

        return Departement.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .manager(manager)
                .build();
    }

    public void updateEntity(Departement departement, UpdateDepartementRequest request) {
        if (departement == null || request == null) {
            return;
        }

        if (request.getNom() != null) {
            departement.setNom(request.getNom());
        }
        if (request.getDescription() != null) {
            departement.setDescription(request.getDescription());
        }
        if (request.getManagerId() != null) {
            utilisateurRepository.findById(request.getManagerId())
                    .ifPresent(departement::setManager);
        }
    }
}
