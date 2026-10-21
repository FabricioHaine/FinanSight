package com.finansight.exception;

/**
 * Recurso solicitado não existe ou não pertence ao usuário autenticado.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
