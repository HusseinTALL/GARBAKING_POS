package com.garbaking.inventoryservice.event;

import com.garbaking.inventoryservice.model.InventoryAuditSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Event emitted whenever inventory stock levels change.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentEvent {
    private Long auditId;
    private Long menuItemId;
    private String menuItemName;
    private Integer changeQuantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String reason;
    private String performedBy;
    private InventoryAuditSource source;
    private String reference;
    private Instant occurredAt;
}
