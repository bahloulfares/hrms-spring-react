package com.fares.gestionrh.exception;

/**
 * Exception levée pour les accès non autorisés
 * Ex: Employé essaie d'accéder aux données d'un autre
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
