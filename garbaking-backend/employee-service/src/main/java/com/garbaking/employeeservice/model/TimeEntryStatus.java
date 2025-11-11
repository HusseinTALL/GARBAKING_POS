package com.garbaking.employeeservice.model;

/**
 * Time entry status enumeration
 */
public enum TimeEntryStatus {
    ACTIVE("Active", "Currently clocked in"),
    COMPLETED("Completed", "Clock out completed"),
    PENDING_APPROVAL("Pending Approval", "Awaiting manager approval"),
    APPROVED("Approved", "Approved by manager"),
    DISPUTED("Disputed", "Time entry disputed"),
    REJECTED("Rejected", "Rejected by manager");

    private final String displayName;
    private final String description;

    TimeEntryStatus(String displayName, String description) {
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
