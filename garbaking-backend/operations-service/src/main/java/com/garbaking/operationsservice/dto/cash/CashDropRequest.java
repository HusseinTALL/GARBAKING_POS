package com.garbaking.operationsservice.dto.cash;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CashDropRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be > 0")
    private BigDecimal amount;

    @NotNull(message = "User ID is required")
    private Long userId;

    private String notes;
}
