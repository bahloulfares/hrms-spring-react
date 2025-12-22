package com.fares.gestionrh.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    /**
     * Constructeur avec format automatique
     * Ex: new ResourceNotFoundException("Congé", "id", 123)
     * → "Congé non trouvé(e) avec id : '123'"
     */
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue){
        super(String.format("%s non trouvé(e) avec %s : '%s'", resourceName, fieldName, fieldValue));
    }
}
