package com.fares.gestionrh.dto.conge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoldeCongeResponse {
    private Long id;
    private String typeCongeNom;
    private String typeCongeCode;
    private Double joursRestants;
    private Integer annee;
}
