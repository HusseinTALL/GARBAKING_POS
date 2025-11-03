package com.garbaking.orderservice.exception;

/**
 * Invalid Order State Exception
 *
 * Thrown when attempting an operation that is not allowed in the current order state.
 */
public class InvalidOrderStateException extends RuntimeException {

    public InvalidOrderStateException(String message) {
        super(message);
    }

    public InvalidOrderStateException(String message, Throwable cause) {
        super(message, cause);
    }
}
