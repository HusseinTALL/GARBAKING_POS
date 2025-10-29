package com.garbaking.inventoryservice.dto;

import com.garbaking.inventoryservice.model.InventoryAuditSource;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

/**
 * Represents a persisted inventory audit entry.
 */
@Value
@Builder
public class InventoryAuditDTO {
    Long id;
    Long menuItemId;
    String menuItemName;
    Integer changeQuantity;
    Integer previousQuantity;
    Integer newQuantity;
    String reason;
    InventoryAuditSource source;
    String performedBy;
    LocalDateTime createdAt;
}
