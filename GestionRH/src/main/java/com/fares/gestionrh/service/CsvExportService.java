package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.conge.CongeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CsvExportService {

    public byte[] exportCongesToCsv(List<CongeResponse> conges) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            writer.println("ID,Type,Employé,Date Début,Date Fin,Nombre Jours,Durée Type,Heure Début,Heure Fin,Statut,Date Demande,Validateur,Date Validation,Motif,Commentaire");
            
            for (CongeResponse conge : conges) {
                writer.printf("%d,%s,%s,%s,%s,%.2f,%s,%s,%s,%s,%s,%s,%s,\"%s\",\"%s\"%n",
                        conge.getId(),
                        escape(conge.getType() != null ? conge.getType() : ""),
                        escape(conge.getEmployeNom()),
                        conge.getDateDebut(),
                        conge.getDateFin(),
                        conge.getNombreJours(),
                        escape(conge.getDureeType()),
                        conge.getHeureDebut() != null ? conge.getHeureDebut() : "",
                        conge.getHeureFin() != null ? conge.getHeureFin() : "",
                        conge.getStatut(),
                        conge.getDateDemande(),
                        escape(conge.getValidateurNom() != null ? conge.getValidateurNom() : ""),
                        conge.getDateValidation() != null ? conge.getDateValidation() : "",
                        escape(conge.getMotif() != null ? conge.getMotif() : ""),
                        escape(conge.getCommentaireValidation() != null ? conge.getCommentaireValidation() : "")
                );
            }
        }
        return baos.toByteArray();
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\"", "\"\"");
    }
}
