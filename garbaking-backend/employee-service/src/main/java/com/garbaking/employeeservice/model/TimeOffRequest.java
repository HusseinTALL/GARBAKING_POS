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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

/**
 * Time Off Request entity for employee leave requests
 */
@Entity
@Table(name = "time_off_requests", indexes = {
    @Index(name = "idx_employee_timeoff", columnList = "employee_id, start_date"),
    @Index(name = "idx_status_timeoff", columnList = "status"),
    @Index(name = "idx_start_date", columnList = "start_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class TimeOffRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull(message = "Employee is required")
    private Employee employee;

    @NotNull(message = "Time off type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "time_off_type", nullable = false)
    private TimeOffType timeOffType;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_days")
    private Integer totalDays;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeOffRequestStatus status = TimeOffRequestStatus.PENDING;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business logic methods

    public void calculateTotalDays() {
        if (startDate != null && endDate != null) {
            Period period = Period.between(startDate, endDate);
            this.totalDays = period.getDays() + 1; // Include both start and end dates
        }
    }

    public void approve(Long reviewerId, String notes) {
        this.status = TimeOffRequestStatus.APPROVED;
        this.reviewedBy = reviewerId;
        this.reviewedAt = LocalDateTime.now();
        this.reviewNotes = notes;
    }

    public void reject(Long reviewerId, String notes) {
        this.status = TimeOffRequestStatus.REJECTED;
        this.reviewedBy = reviewerId;
        this.reviewedAt = LocalDateTime.now();
        this.reviewNotes = notes;
    }

    public void cancel() {
        if (this.status == TimeOffRequestStatus.PENDING) {
            this.status = TimeOffRequestStatus.CANCELLED;
        }
    }

    public boolean isPending() {
        return status == TimeOffRequestStatus.PENDING;
    }

    public boolean isApproved() {
        return status == TimeOffRequestStatus.APPROVED;
    }

    public boolean canBeModified() {
        return status == TimeOffRequestStatus.PENDING;
    }

    public boolean isInFuture() {
        return startDate.isAfter(LocalDate.now());
    }

    public boolean isActive() {
        LocalDate today = LocalDate.now();
        return (today.isEqual(startDate) || today.isAfter(startDate))
                && (today.isEqual(endDate) || today.isBefore(endDate))
                && status == TimeOffRequestStatus.APPROVED;
    }
}
