package com.fares.gestionrh.dto.conge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CongeReportRequest {
    
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String typeConge;
    private String statut;
    private Long departementId;
    private Long employeId;
}
