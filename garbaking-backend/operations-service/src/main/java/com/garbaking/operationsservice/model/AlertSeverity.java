package com.garbaking.operationsservice.model;

/**
 * Severity levels for variance alerts
 */
public enum AlertSeverity {
    LOW,      // Minor variance, within acceptable range
    MEDIUM,   // Moderate variance, requires attention
    HIGH,     // Significant variance, requires immediate investigation
    CRITICAL  // Major variance, potential fraud or serious error
}
