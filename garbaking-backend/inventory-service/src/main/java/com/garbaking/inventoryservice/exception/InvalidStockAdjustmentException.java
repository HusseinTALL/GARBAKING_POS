package com.garbaking.inventoryservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when stock adjustments violate business rules.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidStockAdjustmentException extends RuntimeException {

    public InvalidStockAdjustmentException(String message) {
        super(message);
    }
}
