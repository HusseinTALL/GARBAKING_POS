package com.garbaking.employeeservice.model;

/**
 * Employee status enumeration
 */
public enum EmployeeStatus {
    ACTIVE("Active", "Currently employed and working"),
    ON_LEAVE("On Leave", "Temporarily away (vacation, sick, personal)"),
    SUSPENDED("Suspended", "Temporarily suspended from work"),
    TERMINATED("Terminated", "Employment ended"),
    RETIRED("Retired", "Retired from service");

    private final String displayName;
    private final String description;

    EmployeeStatus(String displayName, String description) {
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
