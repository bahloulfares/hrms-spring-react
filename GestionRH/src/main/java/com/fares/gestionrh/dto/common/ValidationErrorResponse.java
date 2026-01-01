package com.fares.gestionrh.dto.common;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO pour les erreurs de validation
 *
 * Utilisé quand @Valid échoue sur un DTO
 * Retourne un Map avec le nom du champ et le message d'erreur
 *
 * Exemple d'utilisation:
 * POST /api/auth/login avec email invalide
 *
 * Format JSON retourné:
 * {
 *   "status": 400,
 *   "message": "Erreur de validation",
 *   "errors": {
 *     "email": "Format d'email invalide",
 *     "motDePasse": "Le mot de passe est obligatoire"
 *   },
 *   "path": "/api/auth/login",
 *   "timestamp": "2025-01-15 10:30:00"
 * }
 *
 * @author Votre Nom
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ValidationErrorResponse {

    /**
     * Code HTTP (toujours 400 pour validation)
     */
    private int status;

    /**
     * Message général
     */
    private String message;

    /**
     * Map des erreurs par champ
     * Key: Nom du champ (ex: "email")
     * Value: Message d'erreur (ex: "Format d'email invalide")
     */
    private Map<String, String> errors;

    /**
     * Path de la requête
     */
    private String path;

    /**
     * Horodatage de l'erreur
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Constructeur simplifié
     */
    public ValidationErrorResponse(Map<String, String> errors) {
        this.status = 400;
        this.message = "Erreur de validation";
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }
}
