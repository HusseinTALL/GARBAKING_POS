package com.garbaking.inventoryservice.dto.inventory;

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
public class StockLevelDTO {

    private Long id;
    private Long itemId;
    private String itemName;
    private String itemSku;
    private String unit;
    private Long locationId;
    private String locationName;
    private String locationCode;
    private BigDecimal quantityOnHand;
    private BigDecimal quantityReserved;
    private BigDecimal quantityOrdered;
    private BigDecimal quantityAvailable;
    private Boolean isLowStock;
    private BigDecimal reorderPoint;
    private LocalDateTime lastUpdated;
    private LocalDateTime lastCountedAt;
}
