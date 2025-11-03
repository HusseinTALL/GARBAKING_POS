package com.garbaking.inventoryservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request payload for performing a manual inventory audit.
 */
@Data
public class InventoryAuditRequest {

    @NotNull
    private Long menuItemId;

    @NotNull
    @Min(0)
    private Integer countedQuantity;

    @NotBlank
    private String reason;

    private String performedBy;
}
