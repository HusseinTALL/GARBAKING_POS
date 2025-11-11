package com.garbaking.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for Employee Analytics Dashboard
 * Contains aggregated statistics for performance, training, and certifications
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAnalyticsDTO {

    // Performance Review Metrics
    private PerformanceMetrics performanceMetrics;

    // Training Metrics
    private TrainingMetrics trainingMetrics;

    // Certification Metrics
    private CertificationMetrics certificationMetrics;

    // Overall Employee Stats
    private EmployeeStats employeeStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetrics {
        private Long totalReviews;
        private Long draftReviews;
        private Long completedReviews;
        private Long acknowledgedReviews;
        private Double averageOverallRating;
        private Map<String, Double> averageRatingsByMetric; // metric name -> average rating
        private Map<Integer, Long> ratingDistribution; // rating (1-5) -> count
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainingMetrics {
        private Long totalAssignments;
        private Long notStarted;
        private Long inProgress;
        private Long completed;
        private Long overdueTraining;
        private Double completionRate; // percentage
        private Double averageScore; // for completed trainings with scores
        private Map<String, Long> trainingByProgram; // program name -> assignment count
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificationMetrics {
        private Long totalCertifications;
        private Long activeCertifications;
        private Long expiringSoon; // within 30 days
        private Long expiredCertifications;
        private Long pendingVerification;
        private Double complianceRate; // percentage of active certifications
        private Map<String, Long> certificationsByType; // type name -> count
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeStats {
        private Long totalEmployees;
        private Long activeEmployees;
        private Long employeesWithReviews;
        private Long employeesWithTraining;
        private Long employeesWithCertifications;
    }
}
