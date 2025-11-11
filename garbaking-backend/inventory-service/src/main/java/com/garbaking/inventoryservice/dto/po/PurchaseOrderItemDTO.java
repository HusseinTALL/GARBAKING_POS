package com.garbaking.inventoryservice.dto.po;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItemDTO {

    private Long id;
    private Long itemId;
    private String itemName;
    private String itemSku;
    private String unit;
    private BigDecimal quantityOrdered;
    private BigDecimal quantityReceived;
    private BigDecimal remainingQuantity;
    private BigDecimal unitCost;
    private BigDecimal lineTotal;
    private String notes;
    private Boolean fullyReceived;
}
