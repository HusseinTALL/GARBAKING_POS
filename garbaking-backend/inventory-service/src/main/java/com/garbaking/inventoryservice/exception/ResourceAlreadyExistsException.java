package com.garbaking.inventoryservice.exception;

/**
 * Resource Already Exists Exception
 *
 * Thrown when attempting to create a resource with a unique identifier that already exists.
 */
public class ResourceAlreadyExistsException extends RuntimeException {

    public ResourceAlreadyExistsException(String message) {
        super(message);
    }

    public ResourceAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
