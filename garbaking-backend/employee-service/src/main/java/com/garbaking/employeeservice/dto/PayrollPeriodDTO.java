package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.PayrollStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Payroll Period
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollPeriodDTO {

    private Long id;
    private String periodName;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate payDate;
    private PayrollStatus status;

    private BigDecimal totalGrossPay;
    private BigDecimal totalDeductions;
    private BigDecimal totalNetPay;
    private BigDecimal totalHours;
    private BigDecimal totalOvertimeHours;
    private Integer employeeCount;

    private Long approvedBy;
    private String approverName;
    private LocalDateTime approvedAt;
    private LocalDateTime paidAt;

    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
