package com.garbaking.employeeservice.model;

/**
 * Shift swap request status enumeration
 */
public enum ShiftSwapStatus {
    PENDING("Pending", "Awaiting response from other employee"),
    ACCEPTED("Accepted", "Accepted, awaiting manager approval"),
    APPROVED("Approved", "Approved by manager and completed"),
    REJECTED("Rejected", "Rejected by employee or manager"),
    CANCELLED("Cancelled", "Cancelled by requester");

    private final String displayName;
    private final String description;

    ShiftSwapStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
