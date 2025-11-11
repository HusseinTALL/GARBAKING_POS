package com.garbaking.employeeservice.model;

/**
 * Pay type enumeration
 */
public enum PayType {
    HOURLY("Hourly", "Paid by the hour"),
    SALARY("Salary", "Fixed salary per pay period"),
    COMMISSION("Commission", "Commission-based pay"),
    CONTRACT("Contract", "Contract-based payment");

    private final String displayName;
    private final String description;

    PayType(String displayName, String description) {
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
