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
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Time Entry entity for employee clock in/out records
 */
@Entity
@Table(name = "time_entries", indexes = {
    @Index(name = "idx_employee_time", columnList = "employee_id, clock_in_time"),
    @Index(name = "idx_clock_in", columnList = "clock_in_time"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class TimeEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull(message = "Employee is required")
    private Employee employee;

    @NotNull(message = "Clock in time is required")
    @Column(name = "clock_in_time", nullable = false)
    private LocalDateTime clockInTime;

    @Column(name = "clock_out_time")
    private LocalDateTime clockOutTime;

    @Column(name = "break_minutes")
    private Integer breakMinutes = 0;

    @Column(name = "total_hours", precision = 5, scale = 2)
    private BigDecimal totalHours;

    @Column(name = "overtime_hours", precision = 5, scale = 2)
    private BigDecimal overtimeHours;

    @Column(name = "location")
    private String location;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeEntryStatus status = TimeEntryStatus.ACTIVE;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business logic methods

    public void clockOut(LocalDateTime clockOutTime) {
        this.clockOutTime = clockOutTime;
        this.status = TimeEntryStatus.COMPLETED;
        calculateHours();
    }

    public void calculateHours() {
        if (clockInTime == null || clockOutTime == null) {
            return;
        }

        Duration duration = Duration.between(clockInTime, clockOutTime);
        long totalMinutes = duration.toMinutes() - (breakMinutes != null ? breakMinutes : 0);

        BigDecimal hours = BigDecimal.valueOf(totalMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        this.totalHours = hours;

        // Calculate overtime (over 8 hours per day)
        BigDecimal regularHours = BigDecimal.valueOf(8);
        if (hours.compareTo(regularHours) > 0) {
            this.overtimeHours = hours.subtract(regularHours);
        } else {
            this.overtimeHours = BigDecimal.ZERO;
        }
    }

    public boolean isActive() {
        return status == TimeEntryStatus.ACTIVE && clockOutTime == null;
    }

    public boolean isCompleted() {
        return status == TimeEntryStatus.COMPLETED && clockOutTime != null;
    }

    public Duration getCurrentDuration() {
        if (clockInTime == null) return Duration.ZERO;
        LocalDateTime endTime = clockOutTime != null ? clockOutTime : LocalDateTime.now();
        return Duration.between(clockInTime, endTime);
    }

    public BigDecimal getCurrentHours() {
        Duration duration = getCurrentDuration();
        long totalMinutes = duration.toMinutes() - (breakMinutes != null ? breakMinutes : 0);
        return BigDecimal.valueOf(totalMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }
}
