package com.garbaking.inventoryservice.event;

import com.garbaking.inventoryservice.model.InventoryAuditSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Event emitted whenever an inventory audit record is created.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAuditEvent {
    private Long auditId;
    private Long menuItemId;
    private String menuItemName;
    private Integer changeQuantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String reason;
    private InventoryAuditSource source;
    private String performedBy;
    private Instant occurredAt;
}
