package com.fares.gestionrh.dto.poste;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePosteRequest {
    @NotBlank(message = "Le titre du poste est obligatoire")
    private String titre;

    private String description;

    private Double salaireMin;
    private Double salaireMax;

    @NotNull(message = "Le département est obligatoire")
    private Long departementId;
}
