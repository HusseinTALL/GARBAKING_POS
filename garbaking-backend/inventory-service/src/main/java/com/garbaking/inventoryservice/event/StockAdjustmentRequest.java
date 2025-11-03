package com.garbaking.inventoryservice.event;

import com.garbaking.inventoryservice.model.InventoryAuditSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kafka payload used by external services to request stock adjustments.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentRequest {
    private Long menuItemId;
    private Integer quantity;
    private String reason;
    private String performedBy;
    private InventoryAuditSource source;
}
