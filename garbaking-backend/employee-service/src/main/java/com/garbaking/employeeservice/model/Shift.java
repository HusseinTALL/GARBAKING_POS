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

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Shift entity representing a scheduled work shift for an employee
 */
@Entity
@Table(name = "shifts", indexes = {
    @Index(name = "idx_employee_shift", columnList = "employee_id, shift_date"),
    @Index(name = "idx_shift_date", columnList = "shift_date"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_position_shift", columnList = "position_id, shift_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull(message = "Employee is required")
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    @NotNull(message = "Shift date is required")
    @Column(name = "shift_date", nullable = false)
    private LocalDate shiftDate;

    @NotNull(message = "Start time is required")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "break_minutes")
    private Integer breakMinutes = 30;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShiftStatus status = ShiftStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "location")
    private String location;

    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private ShiftTemplate template;

    @Column(name = "created_by")
    private Long createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business logic methods

    public Duration getShiftDuration() {
        LocalDateTime shiftStart = LocalDateTime.of(shiftDate, startTime);
        LocalDateTime shiftEnd = LocalDateTime.of(shiftDate, endTime);

        // Handle overnight shifts
        if (endTime.isBefore(startTime)) {
            shiftEnd = shiftEnd.plusDays(1);
        }

        Duration duration = Duration.between(shiftStart, shiftEnd);

        if (breakMinutes != null && breakMinutes > 0) {
            duration = duration.minusMinutes(breakMinutes);
        }

        return duration;
    }

    public double getShiftHours() {
        Duration duration = getShiftDuration();
        return duration.toMinutes() / 60.0;
    }

    public boolean isToday() {
        return shiftDate.equals(LocalDate.now());
    }

    public boolean isUpcoming() {
        return shiftDate.isAfter(LocalDate.now());
    }

    public boolean isPast() {
        return shiftDate.isBefore(LocalDate.now());
    }

    public boolean overlaps(Shift other) {
        if (!this.shiftDate.equals(other.shiftDate)) {
            return false;
        }

        LocalTime thisStart = this.startTime;
        LocalTime thisEnd = this.endTime;
        LocalTime otherStart = other.startTime;
        LocalTime otherEnd = other.endTime;

        return !thisEnd.isBefore(otherStart) && !thisStart.isAfter(otherEnd);
    }

    public void markCompleted() {
        this.status = ShiftStatus.COMPLETED;
    }

    public void markNoShow() {
        this.status = ShiftStatus.NO_SHOW;
    }

    public void cancel() {
        this.status = ShiftStatus.CANCELLED;
    }
}
