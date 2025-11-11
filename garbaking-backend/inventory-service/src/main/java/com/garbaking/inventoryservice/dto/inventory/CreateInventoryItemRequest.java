package com.garbaking.inventoryservice.dto.inventory;

import com.garbaking.inventoryservice.model.Unit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class CreateInventoryItemRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Unit is required")
    private Unit unit;

    @NotNull(message = "Cost per unit is required")
    @DecimalMin(value = "0.0", message = "Cost per unit must be positive")
    private BigDecimal costPerUnit;

    private Long supplierId;

    @NotNull(message = "Reorder point is required")
    @DecimalMin(value = "0.0", message = "Reorder point must be positive")
    private BigDecimal reorderPoint;

    @NotNull(message = "Reorder quantity is required")
    @DecimalMin(value = "0.0", message = "Reorder quantity must be positive")
    private BigDecimal reorderQuantity;

    private Integer shelfLifeDays;
    private String storageInstructions;
    private Boolean trackExpiry;
    private String barcode;
    private String notes;
}
