package com.fares.gestionrh.dto.departement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartementDTO {
    private Long id;
    private String nom;
    private String description;
    private String managerNom; // Nom complet du manager pour l'affichage
    private Long managerId;
    private java.time.LocalDateTime createdAt;
}
