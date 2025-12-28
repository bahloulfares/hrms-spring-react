package com.fares.gestionrh.dto.history;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AffectationHistoryDTO {
    private Long id;
    private Long utilisateurId;
    private String employeNomComplet;
    private String oldDepartement;
    private String newDepartement;
    private String oldPoste;
    private String newPoste;
    private LocalDateTime dateChangement;
    private String modifiePar;
}
