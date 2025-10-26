package com.garbaking.inventoryservice.exception;

/**
 * Resource Not Found Exception
 *
 * Thrown when a requested resource (menu item, category, etc.) is not found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
