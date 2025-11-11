package com.garbaking.employeeservice.model;

/**
 * Shift status enumeration
 */
public enum ShiftStatus {
    SCHEDULED("Scheduled", "Shift is scheduled"),
    IN_PROGRESS("In Progress", "Shift is currently active"),
    COMPLETED("Completed", "Shift has been completed"),
    CANCELLED("Cancelled", "Shift has been cancelled"),
    NO_SHOW("No Show", "Employee did not show up");

    private final String displayName;
    private final String description;

    ShiftStatus(String displayName, String description) {
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
