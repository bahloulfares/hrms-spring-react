package com.fares.gestionrh.service.impl;

import com.fares.gestionrh.dto.history.AffectationHistoryDTO;
import com.fares.gestionrh.entity.AffectationHistory;
import com.fares.gestionrh.repository.AffectationHistoryRepository;
import com.fares.gestionrh.service.AffectationHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AffectationHistoryServiceImpl implements AffectationHistoryService {

    private final AffectationHistoryRepository historyRepository;

    @Override
    public List<AffectationHistoryDTO> getAllHistory() {
        return historyRepository.findAllByOrderByDateChangementDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AffectationHistoryDTO> getHistoryByEmployee(Long employeeId) {
        return historyRepository.findByUtilisateurIdOrderByDateChangementDesc(employeeId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AffectationHistoryDTO convertToDTO(AffectationHistory history) {
        AffectationHistoryDTO dto = new AffectationHistoryDTO();
        dto.setId(history.getId());
        
        // Handle null utilisateur gracefully
        if (history.getUtilisateur() != null) {
            dto.setUtilisateurId(history.getUtilisateur().getId());
            dto.setEmployeNomComplet(history.getUtilisateur().getNomComplet());
        } else {
            dto.setUtilisateurId(null);
            dto.setEmployeNomComplet("Utilisateur supprimé");
        }
        
        dto.setOldDepartement(history.getOldDepartement());
        dto.setNewDepartement(history.getNewDepartement());
        dto.setOldPoste(history.getOldPoste());
        dto.setNewPoste(history.getNewPoste());
        dto.setDateChangement(history.getDateChangement());
        dto.setModifiePar(history.getModifiePar());
        return dto;
    }
}
