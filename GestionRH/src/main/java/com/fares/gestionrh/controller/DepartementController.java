package com.fares.gestionrh.controller;

import com.fares.gestionrh.dto.departement.CreateDepartementRequest;
import com.fares.gestionrh.dto.departement.DepartementDTO;
import com.fares.gestionrh.dto.departement.UpdateDepartementRequest;

import com.fares.gestionrh.service.DepartementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departements")
@RequiredArgsConstructor
public class DepartementController {

    private final DepartementService departementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<DepartementDTO> createDepartement(@Valid @RequestBody CreateDepartementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departementService.createDepartement(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYE')")
    public ResponseEntity<List<DepartementDTO>> getAllDepartements() {
        return ResponseEntity.ok(departementService.getAllDepartements());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER', 'EMPLOYE')")
    public ResponseEntity<DepartementDTO> getDepartementById(@PathVariable Long id) {
        return ResponseEntity.ok(departementService.getDepartementById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<DepartementDTO> updateDepartement(@PathVariable Long id,
            @Valid @RequestBody UpdateDepartementRequest request) {
        return ResponseEntity.ok(departementService.updateDepartement(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<Void> deleteDepartement(@PathVariable Long id) {
        departementService.deleteDepartement(id);
        return ResponseEntity.noContent().build();
    }
}
