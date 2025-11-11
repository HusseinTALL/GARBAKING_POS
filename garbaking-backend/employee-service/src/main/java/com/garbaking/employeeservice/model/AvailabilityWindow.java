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

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Availability Window entity for employee availability preferences
 */
@Entity
@Table(name = "availability_windows", indexes = {
    @Index(name = "idx_employee_availability", columnList = "employee_id, day_of_week"),
    @Index(name = "idx_active_availability", columnList = "is_active")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AvailabilityWindow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull(message = "Employee is required")
    private Employee employee;

    @NotNull(message = "Day of week is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods

    public boolean isAvailableAt(LocalTime time) {
        if (!isAvailable || !isActive) {
            return false;
        }

        if (startTime == null || endTime == null) {
            return isAvailable;
        }

        return !time.isBefore(startTime) && !time.isAfter(endTime);
    }

    public boolean conflictsWith(LocalTime shiftStart, LocalTime shiftEnd) {
        if (!isAvailable || !isActive) {
            return true; // Conflict if not available
        }

        if (startTime == null || endTime == null) {
            return false; // No conflict if available all day
        }

        // Check if shift times are within availability window
        return shiftStart.isBefore(startTime) || shiftEnd.isAfter(endTime);
    }
}
