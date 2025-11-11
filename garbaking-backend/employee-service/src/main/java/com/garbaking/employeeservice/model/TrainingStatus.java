package com.garbaking.employeeservice.model;

/**
 * Status of employee training
 */
public enum TrainingStatus {
    NOT_STARTED,     // Training not started
    IN_PROGRESS,     // Training in progress
    COMPLETED,       // Training completed
    FAILED,          // Training failed (if applicable)
    EXPIRED          // Training expired (needs renewal)
}
