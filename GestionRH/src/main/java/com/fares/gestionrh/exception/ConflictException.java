package com.fares.gestionrh.exception;

/**
 * Exception levée en cas de conflit de données
 * Ex: Email déjà existant
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }

}
