package com.fares.gestionrh.dto.poste;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePosteRequest {
    @Size(max = 100, message = "Le titre ne peut pas dépasser 100 caractères")
    private String titre;

    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;

    private Double salaireMin;
    private Double salaireMax;

    private Long departementId;
}
