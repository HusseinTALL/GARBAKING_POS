package com.garbaking.employeeservice.model;

/**
 * Status of performance review
 */
public enum ReviewStatus {
    DRAFT,           // Review is being drafted
    IN_PROGRESS,     // Review period is active
    COMPLETED,       // Review is completed
    ACKNOWLEDGED     // Employee has acknowledged the review
}
