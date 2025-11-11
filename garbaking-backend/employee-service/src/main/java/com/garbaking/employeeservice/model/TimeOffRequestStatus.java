package com.garbaking.employeeservice.model;

/**
 * Time off request status enumeration
 */
public enum TimeOffRequestStatus {
    PENDING("Pending", "Awaiting approval"),
    APPROVED("Approved", "Request approved"),
    REJECTED("Rejected", "Request rejected"),
    CANCELLED("Cancelled", "Request cancelled by employee");

    private final String displayName;
    private final String description;

    TimeOffRequestStatus(String displayName, String description) {
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
