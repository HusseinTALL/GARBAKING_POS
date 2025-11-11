package com.garbaking.employeeservice.model;

/**
 * Time off type enumeration
 */
public enum TimeOffType {
    VACATION("Vacation", "Paid vacation time"),
    SICK_LEAVE("Sick Leave", "Sick leave"),
    PERSONAL("Personal", "Personal time off"),
    UNPAID_LEAVE("Unpaid Leave", "Unpaid time off"),
    BEREAVEMENT("Bereavement", "Bereavement leave"),
    JURY_DUTY("Jury Duty", "Jury duty leave"),
    MATERNITY("Maternity", "Maternity leave"),
    PATERNITY("Paternity", "Paternity leave"),
    OTHER("Other", "Other time off");

    private final String displayName;
    private final String description;

    TimeOffType(String displayName, String description) {
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
