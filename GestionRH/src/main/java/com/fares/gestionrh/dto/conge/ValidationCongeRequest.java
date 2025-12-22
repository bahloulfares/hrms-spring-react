package com.fares.gestionrh.dto.conge;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationCongeRequest {

    @NotBlank(message = "Le statut est obligatoire (APPROUVE ou REJETE)")
    private String statut; // APPROUVE ou REJETE

    @Size(max = 500, message = "Le commentaire ne peut pas dépasser 500 caractères")
    private String commentaire;
}
