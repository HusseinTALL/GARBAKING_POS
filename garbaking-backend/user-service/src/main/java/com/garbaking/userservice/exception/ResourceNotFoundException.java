package com.garbaking.userservice.exception;

/**
 * Resource Not Found Exception
 *
 * Thrown when a requested resource (user, etc.) is not found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
