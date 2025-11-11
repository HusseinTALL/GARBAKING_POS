package com.garbaking.inventoryservice.model;

/**
 * Purchase order lifecycle statuses
 */
public enum PurchaseOrderStatus {
    DRAFT,          // Being created/edited
    SUBMITTED,      // Sent to supplier
    APPROVED,       // Approved by manager
    PARTIALLY_RECEIVED,  // Some items received
    RECEIVED,       // All items received
    CANCELLED       // Order cancelled
}
