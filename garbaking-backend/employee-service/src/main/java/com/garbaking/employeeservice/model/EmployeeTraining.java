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
 * Employee Training entity for tracking training completion
 */
@Entity
@Table(name = "employee_training", indexes = {
        @Index(name = "idx_employee_program", columnList = "employee_id, training_program_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_completion_date", columnList = "completion_date")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeTraining {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_program_id", nullable = false)
    private TrainingProgram trainingProgram;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TrainingStatus status;

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "score")
    private Integer score; // If applicable (0-100)

    @Column(name = "trainer_name", length = 100)
    private String trainerName;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Start the training
     */
    public void start() {
        if (this.status == TrainingStatus.NOT_STARTED) {
            this.status = TrainingStatus.IN_PROGRESS;
            this.startDate = LocalDate.now();
        }
    }

    /**
     * Complete the training
     */
    public void complete(Integer score, String certificateUrl) {
        this.status = TrainingStatus.COMPLETED;
        this.completionDate = LocalDate.now();
        this.score = score;
        this.certificateUrl = certificateUrl;
    }

    /**
     * Mark training as failed
     */
    public void fail(String reason) {
        this.status = TrainingStatus.FAILED;
        this.notes = (this.notes != null ? this.notes + "\n" : "") + "Failed: " + reason;
    }

    /**
     * Check if training is overdue
     */
    public boolean isOverdue() {
        if (status == TrainingStatus.COMPLETED || status == TrainingStatus.FAILED) {
            return false;
        }
        return dueDate != null && LocalDate.now().isAfter(dueDate);
    }
}
