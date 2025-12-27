package com.fares.gestionrh.mapper;

import com.fares.gestionrh.dto.poste.CreatePosteRequest;
import com.fares.gestionrh.dto.poste.PosteDTO;
import com.fares.gestionrh.dto.poste.UpdatePosteRequest;
import com.fares.gestionrh.entity.Departement;
import com.fares.gestionrh.entity.Poste;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.repository.DepartementRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PosteMapper {

    private final DepartementRepository departementRepository;

    public PosteDTO toDTO(Poste poste) {
        if (poste == null) {
            return null;
        }
        return PosteDTO.builder()
                .id(poste.getId())
                .titre(poste.getTitre())
                .description(poste.getDescription())
                .salaireMin(poste.getSalaireMin())
                .salaireMax(poste.getSalaireMax())
                .departementId(poste.getDepartement().getId())
                .departementNom(poste.getDepartement().getNom())
                .build();
    }

    public Poste toEntity(CreatePosteRequest request) {
        if (request == null) {
            return null;
        }

        Departement departement = departementRepository.findById(request.getDepartementId())
                .orElseThrow(() -> new ResourceNotFoundException("Département", "id", request.getDepartementId()));

        return Poste.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .salaireMin(request.getSalaireMin())
                .salaireMax(request.getSalaireMax())
                .departement(departement)
                .build();
    }

    public void updateEntity(Poste poste, UpdatePosteRequest request) {
        if (poste == null || request == null) {
            return;
        }

        if (request.getTitre() != null) {
            poste.setTitre(request.getTitre());
        }
        if (request.getDescription() != null) {
            poste.setDescription(request.getDescription());
        }
        if (request.getSalaireMin() != null) {
            poste.setSalaireMin(request.getSalaireMin());
        }
        if (request.getSalaireMax() != null) {
            poste.setSalaireMax(request.getSalaireMax());
        }
        if (request.getDepartementId() != null) {
            departementRepository.findById(request.getDepartementId())
                    .ifPresent(poste::setDepartement);
        }
    }
}
