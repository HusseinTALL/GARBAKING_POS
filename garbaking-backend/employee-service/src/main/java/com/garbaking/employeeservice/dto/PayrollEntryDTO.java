package com.garbaking.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for Payroll Entry
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollEntryDTO {

    private Long id;
    private Long payrollPeriodId;
    private String periodName;

    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private String positionTitle;

    // Hours
    private BigDecimal regularHours;
    private BigDecimal overtimeHours;
    private BigDecimal totalHours;

    // Rates
    private BigDecimal regularRate;
    private BigDecimal overtimeRate;

    // Pay
    private BigDecimal regularPay;
    private BigDecimal overtimePay;
    private BigDecimal tips;
    private BigDecimal bonuses;
    private BigDecimal grossPay;

    // Deductions
    private BigDecimal totalDeductions;
    private BigDecimal netPay;

    private Integer daysWorked;
    private Integer attendanceIssues;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
