package com.fares.gestionrh.dto.conge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CongeStatsResponse {
    
    private long totalDemandes;
    private long demandesEnAttente;
    private long demandesApprouvees;
    private long demandesRejetees;
    private long demandesAnnulees;
    private double totalJoursConsommes;
    private Map<String, Long> parType;
    private Map<String, Long> parStatut;
    private Map<String, Double> joursParType;
}
