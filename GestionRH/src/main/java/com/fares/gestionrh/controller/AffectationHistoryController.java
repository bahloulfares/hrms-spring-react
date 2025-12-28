package com.fares.gestionrh.controller;

import com.fares.gestionrh.dto.history.AffectationHistoryDTO;
import com.fares.gestionrh.service.AffectationHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class AffectationHistoryController {

    private final AffectationHistoryService historyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<List<AffectationHistoryDTO>> getAllHistory() {
        return ResponseEntity.ok(historyService.getAllHistory());
    }

    @GetMapping("/employe/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<List<AffectationHistoryDTO>> getHistoryByEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(historyService.getHistoryByEmployee(id));
    }
}
