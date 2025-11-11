package com.garbaking.employeeservice.model;

/**
 * Status of performance goal
 */
public enum GoalStatus {
    NOT_STARTED,     // Goal has not been started
    IN_PROGRESS,     // Goal is being worked on
    COMPLETED,       // Goal is completed
    CANCELLED,       // Goal is cancelled
    OVERDUE          // Goal is past due date and not completed
}
