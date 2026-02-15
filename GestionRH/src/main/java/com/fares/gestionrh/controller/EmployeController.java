package com.fares.gestionrh.controller;

import com.fares.gestionrh.dto.utilisateur.CreateUtilisateurRequest;
import com.fares.gestionrh.dto.utilisateur.UtilisateurDTO;
import com.fares.gestionrh.service.UtilisateurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur pour la gestion des employés
 * 
 * Endpoints:
 * - POST /api/employes : Créer un employé
 * - GET /api/employes : Lister les employés avec pagination
 * - GET /api/employes/{id} : Récupérer un employé
 * - PUT /api/employes/{id} : Modifier un employé
 * - DELETE /api/employes/{id} : Supprimer un employé
 */
@RestController
@RequestMapping("/api/employes")
@RequiredArgsConstructor
@Tag(name = "Gestion des Employés", description = "Endpoints pour la gestion des employés/utilisateurs")
@SecurityRequirement(name = "Bearer Authentication")
public class EmployeController {

    private final UtilisateurService utilisateurService;

    /**
     * Crée un nouvel employé
     * 
     * @param request Données de création
     * @return DTO de l'employé créé
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Créer un nouvel employé", description = "Crée un nouvel employé avec les données fournies")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Employé créé avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UtilisateurDTO.class))),
            @ApiResponse(responseCode = "400", description = "Erreur de validation"),
            @ApiResponse(responseCode = "409", description = "Email déjà existant"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<UtilisateurDTO> createEmploye(@Valid @RequestBody CreateUtilisateurRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(utilisateurService.creerUtilisateur(request));
    }

    /**
     * Récupère la liste des employés avec pagination et tri
     * 
     * Paramètres de requête:
     * - page : numéro de page (par défaut 0)
     * - size : nombre d'éléments par page (par défaut 20)
     * - sort : tri (ex: sort=nom,asc ou sort=dateCreation,desc)
     * 
     * Exemple: GET /api/employes?page=0&size=10&sort=nom,asc
     * 
     * @param page Numéro de page (0-indexed)
     * @param size Taille de la page
     * @param sortBy Champ de tri
     * @param sortDirection Direction du tri (asc/desc)
     * @return Page d'employés
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    @Operation(summary = "Lister les employés", description = "Récupère la liste paginée des employés avec tri")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste d'employés récupérée avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<Page<UtilisateurDTO>> getAllEmployes(
            @RequestParam(defaultValue = "0")
            @Parameter(description = "Numéro de page (0-indexed)") int page,
            
            @RequestParam(defaultValue = "20")
            @Parameter(description = "Nombre d'éléments par page") int size,
            
            @RequestParam(defaultValue = "dateCreation")
            @Parameter(description = "Champ de tri (ex: nom, email, dateCreation)") String sortBy,
            
            @RequestParam(defaultValue = "DESC")
            @Parameter(description = "Direction du tri (ASC ou DESC)") Sort.Direction sortDirection) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        return ResponseEntity.ok(utilisateurService.getAllUtilisateurs(pageable));
    }

    /**
     * Récupère un employé par son ID
     * 
     * @param id ID de l'employé
     * @return DTO de l'employé
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    @Operation(summary = "Récupérer un employé", description = "Récupère les détails d'un employé par son ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Employé trouvé",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UtilisateurDTO.class))),
            @ApiResponse(responseCode = "404", description = "Employé non trouvé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<UtilisateurDTO> getEmployeById(
            @PathVariable
            @Parameter(description = "ID de l'employé") Long id) {
        return ResponseEntity.ok(utilisateurService.getUtilisateurById(id));
    }

    /**
     * Modifie un employé existant
     * 
     * @param id ID de l'employé
     * @param request Données de modification
     * @return DTO de l'employé modifié
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Modifier un employé", description = "Modifie les informations d'un employé existant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Employé modifié avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UtilisateurDTO.class))),
            @ApiResponse(responseCode = "404", description = "Employé non trouvé"),
            @ApiResponse(responseCode = "409", description = "Email déjà existant"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<UtilisateurDTO> updateEmploye(
            @PathVariable
            @Parameter(description = "ID de l'employé") Long id,
            
            @Valid @RequestBody
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Données de modification") 
            com.fares.gestionrh.dto.utilisateur.UpdateUtilisateurRequest request) {
        return ResponseEntity.ok(utilisateurService.updateUtilisateur(id, request));
    }

    /**
     * Supprime un employé
     * 
     * @param id ID de l'employé à supprimer
     * @return Status 204 No Content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Supprimer un employé", description = "Supprime un employé de la base de données")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Employé supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Employé non trouvé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<Void> deleteEmploye(
            @PathVariable
            @Parameter(description = "ID de l'employé à supprimer") Long id) {
        utilisateurService.deleteUtilisateur(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Réactive un employé inactif
     * 
     * @param id ID de l'employé à réactiver
     * @return DTO de l'employé réactivé
     */
    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    @Operation(summary = "Réactiver un employé", description = "Réactive un employé désactivé")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Employé réactivé avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UtilisateurDTO.class))),
            @ApiResponse(responseCode = "404", description = "Employé non trouvé"),
            @ApiResponse(responseCode = "403", description = "Accès refusé")
    })
    public ResponseEntity<UtilisateurDTO> reactivateEmploye(
            @PathVariable
            @Parameter(description = "ID de l'employé à réactiver") Long id) {
        return ResponseEntity.ok(utilisateurService.reactivateUtilisateur(id));
    }
}
