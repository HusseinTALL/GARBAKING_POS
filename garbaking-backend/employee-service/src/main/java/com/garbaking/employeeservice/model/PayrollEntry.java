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
import java.time.LocalDateTime;

/**
 * Payroll Entry entity for individual employee payroll
 */
@Entity
@Table(name = "payroll_entries", indexes = {
        @Index(name = "idx_period_employee", columnList = "payroll_period_id, employee_id"),
        @Index(name = "idx_employee", columnList = "employee_id")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_period_id", nullable = false)
    private PayrollPeriod payrollPeriod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // Hours worked
    @Column(name = "regular_hours", precision = 10, scale = 2)
    private BigDecimal regularHours;

    @Column(name = "overtime_hours", precision = 10, scale = 2)
    private BigDecimal overtimeHours;

    @Column(name = "total_hours", precision = 10, scale = 2)
    private BigDecimal totalHours;

    // Pay rates (snapshot from employee record)
    @Column(name = "regular_rate", precision = 10, scale = 2)
    private BigDecimal regularRate;

    @Column(name = "overtime_rate", precision = 10, scale = 2)
    private BigDecimal overtimeRate; // Typically 1.5x regular rate

    // Pay calculations
    @Column(name = "regular_pay", precision = 10, scale = 2)
    private BigDecimal regularPay;

    @Column(name = "overtime_pay", precision = 10, scale = 2)
    private BigDecimal overtimePay;

    @Column(name = "tips", precision = 10, scale = 2)
    private BigDecimal tips;

    @Column(name = "bonuses", precision = 10, scale = 2)
    private BigDecimal bonuses;

    @Column(name = "gross_pay", precision = 10, scale = 2)
    private BigDecimal grossPay;

    // Deductions
    @Column(name = "total_deductions", precision = 10, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_pay", precision = 10, scale = 2)
    private BigDecimal netPay;

    // Additional information
    @Column(name = "days_worked")
    private Integer daysWorked;

    @Column(name = "attendance_issues")
    private Integer attendanceIssues; // Late arrivals, no-shows

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Calculate gross pay from hours and rates
     */
    public void calculateGrossPay() {
        // Calculate regular pay
        if (regularHours != null && regularRate != null) {
            this.regularPay = regularHours.multiply(regularRate);
        } else {
            this.regularPay = BigDecimal.ZERO;
        }

        // Calculate overtime pay
        if (overtimeHours != null && overtimeRate != null) {
            this.overtimePay = overtimeHours.multiply(overtimeRate);
        } else {
            this.overtimePay = BigDecimal.ZERO;
        }

        // Calculate gross pay
        this.grossPay = regularPay
                .add(overtimePay)
                .add(tips != null ? tips : BigDecimal.ZERO)
                .add(bonuses != null ? bonuses : BigDecimal.ZERO);
    }

    /**
     * Calculate net pay after deductions
     */
    public void calculateNetPay() {
        if (grossPay == null) {
            calculateGrossPay();
        }

        this.netPay = grossPay.subtract(
                totalDeductions != null ? totalDeductions : BigDecimal.ZERO
        );
    }

    /**
     * Calculate total hours
     */
    public void calculateTotalHours() {
        this.totalHours = (regularHours != null ? regularHours : BigDecimal.ZERO)
                .add(overtimeHours != null ? overtimeHours : BigDecimal.ZERO);
    }

    /**
     * Calculate overtime rate (1.5x regular rate)
     */
    public void calculateOvertimeRate() {
        if (regularRate != null) {
            this.overtimeRate = regularRate.multiply(BigDecimal.valueOf(1.5));
        }
    }
}
