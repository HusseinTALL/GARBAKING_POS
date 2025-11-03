package com.garbaking.inventoryservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Stock Adjustment Data Transfer Object
 *
 * Used for adjusting menu item stock quantities.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentDTO {

    @NotNull(message = "Menu item ID is required")
    private Long menuItemId;

    @NotNull(message = "Quantity is required")
    private Integer quantity;  // Positive to add, negative to subtract

    private String reason;  // Optional reason for adjustment

    private String performedBy;
}
