package com.fares.gestionrh.mapper;

import com.fares.gestionrh.dto.conge.CongeRequest;
import com.fares.gestionrh.dto.conge.CongeResponse;
import com.fares.gestionrh.entity.Conge;
import com.fares.gestionrh.entity.TypeConge;
import com.fares.gestionrh.entity.Utilisateur;
import org.springframework.stereotype.Component;

@Component
public class CongeMapper {

    public Conge toEntity(CongeRequest dto, Utilisateur employe) {
        return Conge.builder()
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .type(TypeConge.valueOf(dto.getType().toUpperCase()))
                .motif(dto.getMotif())
                .employe(employe)
                .build();
    }

    public CongeResponse toDTO(Conge entity) {
        return CongeResponse.builder()
                .id(entity.getId())
                .dateDebut(entity.getDateDebut())
                .dateFin(entity.getDateFin())
                .type(entity.getType().name())
                .statut(entity.getStatut().name())
                .motif(entity.getMotif())
                .commentaireValidation(entity.getCommentaireValidation())
                .nombreJours(entity.getNombreJours())
                .employeId(entity.getEmploye().getId())
                .employeNom(entity.getEmploye().getNomComplet())
                .employeEmail(entity.getEmploye().getEmail())
                .validateurId(entity.getValidateur() != null ? entity.getValidateur().getId() : null)
                .validateurNom(entity.getValidateur() != null ? entity.getValidateur().getNomComplet() : null)
                .dateDemande(entity.getDateDemande())
                .dateValidation(entity.getDateValidation())
                .build();
    }
}