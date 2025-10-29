package com.garbaking.inventoryservice.model;

/**
 * Identifies the system that generated an inventory audit entry.
 */
public enum InventoryAuditSource {
    INVENTORY_SERVICE,
    ORDER_SERVICE,
    SUPPLIER_SYSTEM,
    MANUAL_COUNT,
    EXTERNAL
}
