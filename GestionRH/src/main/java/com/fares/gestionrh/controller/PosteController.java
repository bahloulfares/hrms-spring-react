package com.fares.gestionrh.controller;

import com.fares.gestionrh.dto.poste.CreatePosteRequest;
import com.fares.gestionrh.dto.poste.PosteDTO;
import com.fares.gestionrh.dto.poste.UpdatePosteRequest;

import com.fares.gestionrh.service.PosteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/postes")
@RequiredArgsConstructor
public class PosteController {

    private final PosteService posteService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<PosteDTO> createPoste(@Valid @RequestBody CreatePosteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(posteService.createPoste(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYE')")
    public ResponseEntity<List<PosteDTO>> getAllPostes() {
        return ResponseEntity.ok(posteService.getAllPostes());
    }

    @GetMapping("/departement/{departementId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYE')")
    public ResponseEntity<List<PosteDTO>> getPostesByDepartement(@PathVariable Long departementId) {
        return ResponseEntity.ok(posteService.getPostesByDepartement(departementId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYE')")
    public ResponseEntity<PosteDTO> getPosteById(@PathVariable Long id) {
        return ResponseEntity.ok(posteService.getPosteById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<PosteDTO> updatePoste(@PathVariable Long id, @Valid @RequestBody UpdatePosteRequest request) {
        return ResponseEntity.ok(posteService.updatePoste(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<Void> deletePoste(@PathVariable Long id) {
        posteService.deletePoste(id);
        return ResponseEntity.noContent().build();
    }
}
