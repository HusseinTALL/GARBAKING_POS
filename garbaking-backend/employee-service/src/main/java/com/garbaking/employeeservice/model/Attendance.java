package com.garbaking.employeeservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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
 * Attendance entity for daily attendance summaries
 */
@Entity
@Table(name = "attendance", indexes = {
    @Index(name = "idx_employee_date", columnList = "employee_id, attendance_date", unique = true),
    @Index(name = "idx_attendance_date", columnList = "attendance_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull(message = "Employee is required")
    private Employee employee;

    @NotNull(message = "Attendance date is required")
    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "is_present")
    private Boolean isPresent = false;

    @Column(name = "is_late")
    private Boolean isLate = false;

    @Column(name = "is_absent")
    private Boolean isAbsent = false;

    @Column(name = "is_on_leave")
    private Boolean isOnLeave = false;

    @Column(name = "clock_in_time")
    private LocalDateTime clockInTime;

    @Column(name = "clock_out_time")
    private LocalDateTime clockOutTime;

    @Column(name = "total_hours", precision = 5, scale = 2)
    private BigDecimal totalHours;

    @Column(name = "overtime_hours", precision = 5, scale = 2)
    private BigDecimal overtimeHours;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public void markPresent(LocalDateTime clockInTime, LocalDateTime clockOutTime,
                           BigDecimal totalHours, BigDecimal overtimeHours) {
        this.isPresent = true;
        this.isAbsent = false;
        this.clockInTime = clockInTime;
        this.clockOutTime = clockOutTime;
        this.totalHours = totalHours;
        this.overtimeHours = overtimeHours;
    }

    public void markAbsent() {
        this.isPresent = false;
        this.isAbsent = true;
        this.totalHours = BigDecimal.ZERO;
        this.overtimeHours = BigDecimal.ZERO;
    }

    public void markOnLeave() {
        this.isPresent = false;
        this.isAbsent = false;
        this.isOnLeave = true;
        this.totalHours = BigDecimal.ZERO;
        this.overtimeHours = BigDecimal.ZERO;
    }
}
