package com.fares.gestionrh.dto.conge;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CongeRequest {

    @NotNull(message = "La date de début est obligatoire")
    @FutureOrPresent(message = "La date de début doit être dans le futur ou aujourd'hui")
    private LocalDate dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    @FutureOrPresent(message = "La date de fin doit être dans le futur ou aujourd'hui")
    private LocalDate dateFin;

    @NotBlank(message = "Le type de congé est obligatoire")
    private String type; // CONGE_PAYE, CONGE_MALADIE, CONGE_SANS_SOLDE, RTT

    @Size(max = 500, message = "Le motif ne peut pas dépasser 500 caractères")
    private String motif;

    /**
     * Type de durée : JOURNEE_ENTIERE (défaut), DEMI_JOUR_MATIN, DEMI_JOUR_APRES_MIDI, PAR_HEURE
     */
    private String dureeType;

    /**
     * Heures de début/fin pour le mode PAR_HEURE
     */
    private LocalTime heureDebut;
    private LocalTime heureFin;
}
