package com.garbaking.operationsservice.model;

public enum ReconciliationStatus {
    BALANCED,  // Expected and counted match exactly
    SHORT,     // Counted less than expected (shortage)
    OVER       // Counted more than expected (overage)
}
