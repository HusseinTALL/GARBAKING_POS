package com.garbaking.employeeservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Payroll Period entity for managing pay periods
 */
@Entity
@Table(name = "payroll_periods", indexes = {
        @Index(name = "idx_period_dates", columnList = "start_date, end_date"),
        @Index(name = "idx_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "period_name", nullable = false, length = 100)
    private String periodName; // e.g., "January 1-15, 2024"

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "pay_date")
    private LocalDate payDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PayrollStatus status;

    @Column(name = "total_gross_pay", precision = 10, scale = 2)
    private BigDecimal totalGrossPay;

    @Column(name = "total_deductions", precision = 10, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "total_net_pay", precision = 10, scale = 2)
    private BigDecimal totalNetPay;

    @Column(name = "total_hours", precision = 10, scale = 2)
    private BigDecimal totalHours;

    @Column(name = "total_overtime_hours", precision = 10, scale = 2)
    private BigDecimal totalOvertimeHours;

    @Column(name = "employee_count")
    private Integer employeeCount;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Approve the payroll period
     */
    public void approve(Long approverId) {
        if (this.status != PayrollStatus.PROCESSING) {
            throw new IllegalStateException("Can only approve payroll in PROCESSING status");
        }
        this.status = PayrollStatus.APPROVED;
        this.approvedBy = approverId;
        this.approvedAt = LocalDateTime.now();
    }

    /**
     * Mark payroll as paid
     */
    public void markPaid() {
        if (this.status != PayrollStatus.APPROVED) {
            throw new IllegalStateException("Can only mark APPROVED payroll as paid");
        }
        this.status = PayrollStatus.PAID;
        this.paidAt = LocalDateTime.now();
    }

    /**
     * Calculate totals from payroll entries
     */
    public void calculateTotals(BigDecimal grossPay, BigDecimal deductions, BigDecimal netPay,
                                BigDecimal hours, BigDecimal overtimeHours, Integer count) {
        this.totalGrossPay = grossPay;
        this.totalDeductions = deductions;
        this.totalNetPay = netPay;
        this.totalHours = hours;
        this.totalOvertimeHours = overtimeHours;
        this.employeeCount = count;
    }
}
