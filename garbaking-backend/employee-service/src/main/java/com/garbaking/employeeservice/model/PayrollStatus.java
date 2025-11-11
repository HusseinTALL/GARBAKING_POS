package com.garbaking.employeeservice.model;

/**
 * Status of payroll period or entry
 */
public enum PayrollStatus {
    DRAFT,           // Payroll is being prepared
    PROCESSING,      // Payroll is being processed
    APPROVED,        // Payroll approved by manager
    PAID,            // Payroll has been paid
    CANCELLED        // Payroll cancelled
}
