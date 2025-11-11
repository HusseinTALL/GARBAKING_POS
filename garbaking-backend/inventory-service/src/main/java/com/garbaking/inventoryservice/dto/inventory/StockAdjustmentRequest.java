package com.garbaking.inventoryservice.dto.inventory;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentRequest {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotNull(message = "Quantity is required")
    private BigDecimal quantity;  // Positive for increase, negative for decrease

    @NotNull(message = "Adjustment type is required")
    private String adjustmentType;  // "RECEIVE", "WASTAGE", "THEFT", "SPOILAGE", "COUNT"

    private String reason;
    private String notes;
}
