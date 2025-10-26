package com.garbaking.userservice.exception;

/**
 * User Already Exists Exception
 *
 * Thrown when attempting to register a user with an email that already exists.
 */
public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException(String message) {
        super(message);
    }

    public UserAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
