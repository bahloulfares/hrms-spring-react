package com.fares.gestionrh.exception;

/**
 * Exception levée lors d'erreurs d'authentification
 * Ex: Identifiants invalides, compte désactivé
 */
public class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
