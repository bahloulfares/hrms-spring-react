package com.fares.gestionrh.exception;

/**
 * Exception levée pour les erreurs de validation métier
 * (différent de la validation Bean @Valid)
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
