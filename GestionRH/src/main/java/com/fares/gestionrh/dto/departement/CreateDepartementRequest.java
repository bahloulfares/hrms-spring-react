package com.fares.gestionrh.dto.departement;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDepartementRequest {
    @NotBlank(message = "Le nom du département est obligatoire")
    private String nom;

    private String description;

    private Long managerId; // ID de l'utilisateur manager (optionnel)
}
