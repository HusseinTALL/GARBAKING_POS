package com.garbaking.employeeservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Performance Goal entity for tracking employee objectives
 */
@Entity
@Table(name = "performance_goals", indexes = {
        @Index(name = "idx_employee_goal", columnList = "employee_id, due_date"),
        @Index(name = "idx_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private Employee createdBy;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GoalStatus status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    // Progress percentage (0-100)
    @Column(name = "progress_percentage")
    private Integer progressPercentage;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Check if goal is overdue
     */
    public boolean isOverdue() {
        if (status == GoalStatus.COMPLETED || status == GoalStatus.CANCELLED) {
            return false;
        }
        return dueDate != null && LocalDate.now().isAfter(dueDate);
    }

    /**
     * Update goal status based on progress and due date
     */
    public void updateStatus() {
        if (isOverdue() && status != GoalStatus.COMPLETED && status != GoalStatus.CANCELLED) {
            this.status = GoalStatus.OVERDUE;
        } else if (progressPercentage != null && progressPercentage >= 100 && status != GoalStatus.COMPLETED) {
            complete(null);
        } else if (progressPercentage != null && progressPercentage > 0 && status == GoalStatus.NOT_STARTED) {
            this.status = GoalStatus.IN_PROGRESS;
        }
    }

    /**
     * Mark goal as completed
     */
    public void complete(String completionNotes) {
        this.status = GoalStatus.COMPLETED;
        this.completedDate = LocalDate.now();
        this.progressPercentage = 100;
        this.completionNotes = completionNotes;
    }

    /**
     * Cancel the goal
     */
    public void cancel() {
        this.status = GoalStatus.CANCELLED;
    }
}
