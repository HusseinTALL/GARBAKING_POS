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

import java.time.LocalDateTime;

/**
 * Shift Swap Request entity for employees trading shifts
 */
@Entity
@Table(name = "shift_swap_requests", indexes = {
    @Index(name = "idx_requester_swap", columnList = "requester_id, status"),
    @Index(name = "idx_target_swap", columnList = "target_employee_id, status"),
    @Index(name = "idx_status_swap", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ShiftSwapRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    @NotNull(message = "Requester is required")
    private Employee requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_shift_id", nullable = false)
    @NotNull(message = "Requester shift is required")
    private Shift requesterShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_employee_id")
    private Employee targetEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_shift_id")
    private Shift targetShift;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShiftSwapStatus status = ShiftSwapStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String requestMessage;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "response_message", columnDefinition = "TEXT")
    private String responseMessage;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approval_notes", columnDefinition = "TEXT")
    private String approvalNotes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business logic methods

    public void accept(String responseMessage) {
        this.status = ShiftSwapStatus.ACCEPTED;
        this.respondedAt = LocalDateTime.now();
        this.responseMessage = responseMessage;
    }

    public void reject(String responseMessage) {
        this.status = ShiftSwapStatus.REJECTED;
        this.respondedAt = LocalDateTime.now();
        this.responseMessage = responseMessage;
    }

    public void approve(Long managerId, String approvalNotes) {
        this.status = ShiftSwapStatus.APPROVED;
        this.approvedBy = managerId;
        this.approvedAt = LocalDateTime.now();
        this.approvalNotes = approvalNotes;

        // Swap the shift assignments
        if (targetShift != null) {
            Employee temp = requesterShift.getEmployee();
            requesterShift.setEmployee(targetShift.getEmployee());
            targetShift.setEmployee(temp);
        } else if (targetEmployee != null) {
            requesterShift.setEmployee(targetEmployee);
        }
    }

    public void cancel() {
        if (this.status == ShiftSwapStatus.PENDING || this.status == ShiftSwapStatus.ACCEPTED) {
            this.status = ShiftSwapStatus.CANCELLED;
        }
    }

    public boolean isPending() {
        return status == ShiftSwapStatus.PENDING;
    }

    public boolean isAccepted() {
        return status == ShiftSwapStatus.ACCEPTED;
    }

    public boolean needsManagerApproval() {
        return status == ShiftSwapStatus.ACCEPTED;
    }

    public boolean canBeCancelled() {
        return status == ShiftSwapStatus.PENDING || status == ShiftSwapStatus.ACCEPTED;
    }
}
