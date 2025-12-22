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

import com.fares.gestionrh.dto.conge.CongeRequest;
import com.fares.gestionrh.dto.conge.CongeResponse;
import com.fares.gestionrh.dto.conge.ValidationCongeRequest;
import com.fares.gestionrh.service.CongeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/conges")
@RequiredArgsConstructor
public class CongeController {

    private final CongeService congeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<CongeResponse> creerDemande(@Valid @RequestBody CongeRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(congeService.creerDemande(request, auth.getName()));
    }

    @GetMapping("/mes-conges")
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<CongeResponse>> getMesConges(Authentication auth) {
        return ResponseEntity.ok(congeService.getMesConges(auth.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<CongeResponse> getCongeById(@PathVariable Long id) {
        return ResponseEntity.ok(congeService.getCongeById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<CongeResponse> annulerDemande(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(congeService.annulerDemande(id, auth.getName()));
    }

    @GetMapping("/en-attente")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<CongeResponse>> getDemandesEnAttente() {
        return ResponseEntity.ok(congeService.getDemandesEnAttente());
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<CongeResponse> validerDemande(@PathVariable Long id,
            @Valid @RequestBody ValidationCongeRequest request,
            Authentication auth) {
        return ResponseEntity.ok(congeService.validerDemande(id, request, auth.getName()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<CongeResponse>> getAllConges() {
        return ResponseEntity.ok(congeService.getAllConges());
    }
}
