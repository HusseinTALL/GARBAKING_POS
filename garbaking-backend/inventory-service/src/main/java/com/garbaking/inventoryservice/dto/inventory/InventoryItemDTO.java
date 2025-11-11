package com.garbaking.inventoryservice.dto.inventory;

import com.garbaking.inventoryservice.model.Unit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDTO {

    private Long id;
    private String sku;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Unit unit;
    private String unitDisplay;  // For frontend display
    private BigDecimal costPerUnit;
    private Long supplierId;
    private String supplierName;
    private BigDecimal reorderPoint;
    private BigDecimal reorderQuantity;
    private Integer shelfLifeDays;
    private String storageInstructions;
    private Boolean isActive;
    private Boolean trackExpiry;
    private String barcode;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Stock information (aggregated from StockLevels)
    private BigDecimal totalStockOnHand;
    private BigDecimal totalStockAvailable;
    private Boolean isLowStock;
}
