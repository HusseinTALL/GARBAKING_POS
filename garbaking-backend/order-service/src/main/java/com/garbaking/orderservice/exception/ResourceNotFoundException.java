package com.garbaking.orderservice.exception;

/**
 * Resource Not Found Exception
 *
 * Thrown when a requested resource (order, etc.) is not found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
