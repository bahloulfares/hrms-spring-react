package com.fares.gestionrh.dto.conge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CongeResponse {

    private Long id;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String type;
    private String statut;
    private String motif;
    private String commentaireValidation;
    private Long nombreJours;

    // Informations de l'employé
    private Long employeId;
    private String employeNom;
    private String employeEmail;

    // Informations du validateur
    private Long validateurId;
    private String validateurNom;

    // Dates
    private LocalDateTime dateDemande;
    private LocalDateTime dateValidation;
}
