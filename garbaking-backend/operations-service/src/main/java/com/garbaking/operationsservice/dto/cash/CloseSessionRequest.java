package com.garbaking.operationsservice.dto.cash;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class CloseSessionRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Counted cash is required")
    @DecimalMin(value = "0.00", message = "Counted cash must be >= 0")
    private BigDecimal countedCash;

    // Optional: Denomination counts for closing
    private Map<String, Integer> denominationCounts;

    // Optional notes about the closing
    private String notes;

    // Optional: Variance reason if there's a discrepancy
    private String varianceReason;
}
