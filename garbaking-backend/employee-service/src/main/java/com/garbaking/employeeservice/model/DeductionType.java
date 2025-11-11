package com.garbaking.employeeservice.model;

/**
 * Type of payroll deduction
 */
public enum DeductionType {
    TAX,                // Tax deduction
    HEALTH_INSURANCE,   // Health insurance
    RETIREMENT,         // 401k, pension, etc.
    GARNISHMENT,        // Court-ordered garnishment
    ADVANCE,            // Advance repayment
    OTHER               // Other deductions
}
