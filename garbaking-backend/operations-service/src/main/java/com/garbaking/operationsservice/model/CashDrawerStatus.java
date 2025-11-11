package com.garbaking.operationsservice.model;

public enum CashDrawerStatus {
    OPEN,      // Currently in use by a cashier
    CLOSED,    // Not in use, no active session
    LOCKED     // Administratively locked
}
