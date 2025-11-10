package com.garbaking.operationsservice.dto.cash;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class OpenSessionRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Starting cash is required")
    @DecimalMin(value = "0.00", message = "Starting cash must be >= 0")
    private BigDecimal startingCash;

    // Optional: Denomination counts (e.g., {"100.00": 5, "50.00": 10, "20.00": 20})
    private Map<String, Integer> denominationCounts;
}
