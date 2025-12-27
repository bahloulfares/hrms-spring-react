package com.fares.gestionrh.dto.poste;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosteDTO {
    private Long id;
    private String titre;
    private String description;
    private Double salaireMin;
    private Double salaireMax;
    private Long departementId;
    private String departementNom;
}
