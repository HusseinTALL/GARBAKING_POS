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
 * Performance Review entity for employee evaluations
 */
@Entity
@Table(name = "performance_reviews", indexes = {
        @Index(name = "idx_employee_review", columnList = "employee_id, review_date"),
        @Index(name = "idx_reviewer", columnList = "reviewer_id"),
        @Index(name = "idx_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    @Column(name = "review_date", nullable = false)
    private LocalDate reviewDate;

    @Column(name = "review_period_start", nullable = false)
    private LocalDate reviewPeriodStart;

    @Column(name = "review_period_end", nullable = false)
    private LocalDate reviewPeriodEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status;

    // Performance Ratings (1-5 scale)
    @Column(name = "quality_of_work")
    private Integer qualityOfWork;

    @Column(name = "productivity")
    private Integer productivity;

    @Column(name = "attendance_punctuality")
    private Integer attendancePunctuality;

    @Column(name = "teamwork")
    private Integer teamwork;

    @Column(name = "communication")
    private Integer communication;

    @Column(name = "customer_service")
    private Integer customerService;

    @Column(name = "initiative")
    private Integer initiative;

    @Column(name = "leadership")
    private Integer leadership;

    // Overall rating (average of all ratings)
    @Column(name = "overall_rating")
    private Double overallRating;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "areas_for_improvement", columnDefinition = "TEXT")
    private String areasForImprovement;

    @Column(columnDefinition = "TEXT")
    private String goals;

    @Column(name = "reviewer_comments", columnDefinition = "TEXT")
    private String reviewerComments;

    @Column(name = "employee_comments", columnDefinition = "TEXT")
    private String employeeComments;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Calculate overall rating from individual ratings
     */
    public void calculateOverallRating() {
        int count = 0;
        int sum = 0;

        if (qualityOfWork != null) {
            sum += qualityOfWork;
            count++;
        }
        if (productivity != null) {
            sum += productivity;
            count++;
        }
        if (attendancePunctuality != null) {
            sum += attendancePunctuality;
            count++;
        }
        if (teamwork != null) {
            sum += teamwork;
            count++;
        }
        if (communication != null) {
            sum += communication;
            count++;
        }
        if (customerService != null) {
            sum += customerService;
            count++;
        }
        if (initiative != null) {
            sum += initiative;
            count++;
        }
        if (leadership != null) {
            sum += leadership;
            count++;
        }

        if (count > 0) {
            this.overallRating = (double) sum / count;
        } else {
            this.overallRating = null;
        }
    }

    /**
     * Complete the review
     */
    public void complete() {
        this.status = ReviewStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        calculateOverallRating();
    }

    /**
     * Employee acknowledges the review
     */
    public void acknowledge() {
        if (this.status != ReviewStatus.COMPLETED) {
            throw new IllegalStateException("Can only acknowledge completed reviews");
        }
        this.status = ReviewStatus.ACKNOWLEDGED;
        this.acknowledgedAt = LocalDateTime.now();
    }
}
