package com.fares.gestionrh.mapper;

import com.fares.gestionrh.dto.conge.CongeRequest;
import com.fares.gestionrh.dto.conge.CongeResponse;
import com.fares.gestionrh.entity.Conge;
import com.fares.gestionrh.entity.TypeConge;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.repository.TypeCongeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CongeMapper {

    private final TypeCongeRepository typeCongeRepository;

    public Conge toEntity(CongeRequest dto, Utilisateur employe) {
        TypeConge type = typeCongeRepository.findByCode(dto.getType().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Type de congé non trouvé: " + dto.getType()));

        return Conge.builder()
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .type(type)
            .dureeType(parseDureeType(dto.getDureeType()))
            .heureDebut(dto.getHeureDebut())
            .heureFin(dto.getHeureFin())
            // nombreJours sera calculé dans le service pour intégrer la logique partielle/horaire
            .nombreJours(0.0)
                .motif(dto.getMotif())
                .employe(employe)
                .build();
    }

    public CongeResponse toDTO(Conge entity) {
        return CongeResponse.builder()
                .id(entity.getId())
                .dateDebut(entity.getDateDebut())
                .dateFin(entity.getDateFin())
                .type(entity.getType().getCode())
                .statut(entity.getStatut().name())
                .motif(entity.getMotif())
                .commentaireValidation(entity.getCommentaireValidation())
                .nombreJours(entity.getNombreJours())
                .dureeType(entity.getDureeType() != null ? entity.getDureeType().name() : null)
                .heureDebut(entity.getHeureDebut())
                .heureFin(entity.getHeureFin())
                .employeId(entity.getEmploye().getId())
                .employeNom(entity.getEmploye().getNomComplet())
                .employeEmail(entity.getEmploye().getEmail())
                .validateurId(entity.getValidateur() != null ? entity.getValidateur().getId() : null)
                .validateurNom(entity.getValidateur() != null ? entity.getValidateur().getNomComplet() : null)
                .dateDemande(entity.getDateDemande())
                .dateValidation(entity.getDateValidation())
                .build();
    }

    private Conge.DureeType parseDureeType(String raw) {
        if (raw == null || raw.isBlank()) {
            return Conge.DureeType.JOURNEE_ENTIERE;
        }
        try {
            return Conge.DureeType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return Conge.DureeType.JOURNEE_ENTIERE;
        }
    }
}