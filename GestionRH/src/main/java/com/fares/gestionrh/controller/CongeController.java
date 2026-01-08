package com.fares.gestionrh.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fares.gestionrh.dto.conge.CongeReportRequest;
import com.fares.gestionrh.dto.conge.CongeRequest;
import com.fares.gestionrh.dto.conge.CongeResponse;
import com.fares.gestionrh.dto.conge.CongeStatsResponse;
import com.fares.gestionrh.dto.conge.SoldeCongeResponse;
import com.fares.gestionrh.dto.conge.ValidationCongeRequest;
import com.fares.gestionrh.service.CongeService;
import com.fares.gestionrh.service.CsvExportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/conges")
@RequiredArgsConstructor
public class CongeController {

    private final CongeService congeService;
    private final CsvExportService csvExportService;

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYE', 'MANAGER', 'ADMIN', 'RH')")
    public ResponseEntity<CongeResponse> creerDemande(@Valid @RequestBody CongeRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(congeService.creerDemande(request, auth.getName()));
    }

    @GetMapping("/mes-conges")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'MANAGER', 'ADMIN', 'RH')")
    public ResponseEntity<List<CongeResponse>> getMesConges(Authentication auth) {
        return ResponseEntity.ok(congeService.getMesConges(auth.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'MANAGER', 'ADMIN', 'RH')")
    public ResponseEntity<CongeResponse> getCongeById(@PathVariable Long id) {
        return ResponseEntity.ok(congeService.getCongeById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'MANAGER', 'ADMIN', 'RH')")
    public ResponseEntity<CongeResponse> annulerDemande(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(congeService.annulerDemande(id, auth.getName()));
    }

    @GetMapping("/en-attente")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH', 'ADMIN')")
    public ResponseEntity<List<CongeResponse>> getDemandesEnAttente(Authentication auth) {
        return ResponseEntity.ok(congeService.getDemandesEnAttente(auth.getName()));
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH', 'ADMIN')")
    public ResponseEntity<CongeResponse> validerDemande(@PathVariable Long id,
            @Valid @RequestBody ValidationCongeRequest request,
            Authentication auth) {
        return ResponseEntity.ok(congeService.validerDemande(id, request, auth.getName()));
    }

    @GetMapping("/mes-soldes")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'MANAGER', 'ADMIN', 'RH')")
    public ResponseEntity<List<SoldeCongeResponse>> getMesSoldes(Authentication auth) {
        return ResponseEntity.ok(congeService.getMesSoldes(auth.getName()));
    }

    @GetMapping("/soldes/employe/{employeId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'RH')")
    public ResponseEntity<List<SoldeCongeResponse>> getSoldesEmploye(
            @PathVariable Long employeId,
            Authentication auth) {
        return ResponseEntity.ok(congeService.getSoldesEmploye(employeId, auth.getName()));
    }

    @GetMapping("/soldes/departement")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'RH')")
    public ResponseEntity<List<Map<String, Object>>> getSoldesDepartement(Authentication auth) {
        return ResponseEntity.ok(congeService.getSoldesDepartement(auth.getName()));
    }

    @GetMapping("/types")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'MANAGER', 'ADMIN', 'RH')")
    public ResponseEntity<List<com.fares.gestionrh.entity.TypeConge>> getAllTypes() {
        return ResponseEntity.ok(congeService.getAllTypes());
    }

    @PostMapping("/admin/initialiser-soldes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> initialiserSoldes() {
        int anneeActuelle = java.time.LocalDate.now().getYear();
        Map<String, Object> rapport = congeService.initialiserTousLesSoldes(anneeActuelle);
        return ResponseEntity.ok(rapport);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CongeResponse>> getAllConges() {
        return ResponseEntity.ok(congeService.getAllConges());
    }

    @PostMapping("/report/statistics")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH', 'ADMIN')")
    public ResponseEntity<CongeStatsResponse> getStatistics(@RequestBody CongeReportRequest request) {
        return ResponseEntity.ok(congeService.getStatistics(request));
    }

    @PostMapping("/report/export")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH', 'ADMIN')")
    public ResponseEntity<List<CongeResponse>> getReport(@RequestBody CongeReportRequest request) {
        return ResponseEntity.ok(congeService.getReport(request));
    }

    @PostMapping("/report/export-csv")
    @PreAuthorize("hasAnyRole('MANAGER', 'RH', 'ADMIN')")
    public ResponseEntity<byte[]> exportCsv(@RequestBody CongeReportRequest request) throws IOException {
        List<CongeResponse> conges = congeService.getReport(request);
        byte[] csv = csvExportService.exportCongesToCsv(conges);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "conges-export.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csv);
    }
}
