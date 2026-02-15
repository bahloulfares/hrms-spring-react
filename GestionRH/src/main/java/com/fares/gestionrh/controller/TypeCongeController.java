package com.fares.gestionrh.controller;

import com.fares.gestionrh.entity.TypeConge;
import com.fares.gestionrh.service.TypeCongeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/type-conges")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TypeCongeController {

    private final TypeCongeService typeCongeService;

    @GetMapping
    public List<TypeConge> getAll() {
        return typeCongeService.getAllTypes();
    }

    @GetMapping("/all")
    public List<TypeConge> getAllIncludingInactive() {
        return typeCongeService.getAllTypesIncludingInactive();
    }

    @GetMapping("/inactive")
    public List<TypeConge> getInactive() {
        return typeCongeService.getInactiveTypes();
    }

    @PostMapping
    public TypeConge create(@RequestBody TypeConge typeConge) {
        return typeCongeService.createType(typeConge);
    }

    @PutMapping("/{id}")
    public TypeConge update(@PathVariable Long id, @RequestBody TypeConge typeConge) {
        return typeCongeService.updateType(id, typeConge);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        typeCongeService.deleteType(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reactivate")
    public TypeConge reactivate(@PathVariable Long id) {
        return typeCongeService.reactivateType(id);
    }
}
