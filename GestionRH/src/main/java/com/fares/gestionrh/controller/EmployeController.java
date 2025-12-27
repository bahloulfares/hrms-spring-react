package com.fares.gestionrh.controller;

import com.fares.gestionrh.dto.utilisateur.CreateUtilisateurRequest;
import com.fares.gestionrh.dto.utilisateur.UtilisateurDTO;
import com.fares.gestionrh.service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employes")
@RequiredArgsConstructor
public class EmployeController {

    private final UtilisateurService utilisateurService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilisateurDTO> createEmploye(@Valid @RequestBody CreateUtilisateurRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(utilisateurService.creerUtilisateur(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<List<UtilisateurDTO>> getAllEmployes() {
        return ResponseEntity.ok(utilisateurService.getAllUtilisateurs());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<UtilisateurDTO> getEmployeById(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.getUtilisateurById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilisateurDTO> updateEmploye(@PathVariable Long id,
            @Valid @RequestBody com.fares.gestionrh.dto.utilisateur.UpdateUtilisateurRequest request) {
        return ResponseEntity.ok(utilisateurService.updateUtilisateur(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmploye(@PathVariable Long id) {
        utilisateurService.deleteUtilisateur(id);
        return ResponseEntity.noContent().build();
    }
}
