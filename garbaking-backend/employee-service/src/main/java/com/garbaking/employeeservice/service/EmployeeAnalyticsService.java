package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.EmployeeAnalyticsDTO;
import com.garbaking.employeeservice.model.*;
import com.garbaking.employeeservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for calculating employee analytics and metrics
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmployeeAnalyticsService {

    private final EmployeeRepository employeeRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final EmployeeTrainingRepository employeeTrainingRepository;
    private final EmployeeCertificationRepository employeeCertificationRepository;

    @Transactional(readOnly = true)
    public EmployeeAnalyticsDTO getEmployeeAnalytics() {
        log.info("Calculating employee analytics");

        return EmployeeAnalyticsDTO.builder()
                .performanceMetrics(calculatePerformanceMetrics())
                .trainingMetrics(calculateTrainingMetrics())
                .certificationMetrics(calculateCertificationMetrics())
                .employeeStats(calculateEmployeeStats())
                .build();
    }

    private EmployeeAnalyticsDTO.PerformanceMetrics calculatePerformanceMetrics() {
        List<PerformanceReview> allReviews = performanceReviewRepository.findAll();

        long totalReviews = allReviews.size();
        long draftReviews = allReviews.stream().filter(r -> r.getStatus() == ReviewStatus.DRAFT).count();
        long completedReviews = allReviews.stream().filter(r -> r.getStatus() == ReviewStatus.COMPLETED).count();
        long acknowledgedReviews = allReviews.stream().filter(r -> r.getStatus() == ReviewStatus.ACKNOWLEDGED).count();

        // Calculate average overall rating
        Double averageOverallRating = allReviews.stream()
                .filter(r -> r.getOverallRating() != null)
                .mapToDouble(PerformanceReview::getOverallRating)
                .average()
                .orElse(0.0);

        // Calculate average ratings by metric
        Map<String, Double> averageRatingsByMetric = new LinkedHashMap<>();
        averageRatingsByMetric.put("Quality of Work", calculateAverageMetric(allReviews, PerformanceReview::getQualityOfWork));
        averageRatingsByMetric.put("Productivity", calculateAverageMetric(allReviews, PerformanceReview::getProductivity));
        averageRatingsByMetric.put("Attendance & Punctuality", calculateAverageMetric(allReviews, PerformanceReview::getAttendancePunctuality));
        averageRatingsByMetric.put("Teamwork", calculateAverageMetric(allReviews, PerformanceReview::getTeamwork));
        averageRatingsByMetric.put("Communication", calculateAverageMetric(allReviews, PerformanceReview::getCommunication));
        averageRatingsByMetric.put("Customer Service", calculateAverageMetric(allReviews, PerformanceReview::getCustomerService));
        averageRatingsByMetric.put("Initiative", calculateAverageMetric(allReviews, PerformanceReview::getInitiative));
        averageRatingsByMetric.put("Leadership", calculateAverageMetric(allReviews, PerformanceReview::getLeadership));

        // Calculate rating distribution
        Map<Integer, Long> ratingDistribution = new TreeMap<>();
        for (int i = 1; i <= 5; i++) {
            final int rating = i;
            long count = allReviews.stream()
                    .filter(r -> r.getOverallRating() != null)
                    .filter(r -> Math.round(r.getOverallRating()) == rating)
                    .count();
            ratingDistribution.put(rating, count);
        }

        return EmployeeAnalyticsDTO.PerformanceMetrics.builder()
                .totalReviews(totalReviews)
                .draftReviews(draftReviews)
                .completedReviews(completedReviews)
                .acknowledgedReviews(acknowledgedReviews)
                .averageOverallRating(averageOverallRating)
                .averageRatingsByMetric(averageRatingsByMetric)
                .ratingDistribution(ratingDistribution)
                .build();
    }

    private Double calculateAverageMetric(List<PerformanceReview> reviews,
                                          java.util.function.Function<PerformanceReview, Integer> metricGetter) {
        return reviews.stream()
                .map(metricGetter)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
    }

    private EmployeeAnalyticsDTO.TrainingMetrics calculateTrainingMetrics() {
        List<EmployeeTraining> allTraining = employeeTrainingRepository.findAll();

        long totalAssignments = allTraining.size();
        long notStarted = allTraining.stream().filter(t -> t.getStatus() == TrainingStatus.NOT_STARTED).count();
        long inProgress = allTraining.stream().filter(t -> t.getStatus() == TrainingStatus.IN_PROGRESS).count();
        long completed = allTraining.stream().filter(t -> t.getStatus() == TrainingStatus.COMPLETED).count();

        // Calculate overdue training
        LocalDate today = LocalDate.now();
        long overdueTraining = allTraining.stream()
                .filter(t -> t.getStatus() != TrainingStatus.COMPLETED)
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(today))
                .count();

        // Calculate completion rate
        Double completionRate = totalAssignments > 0
                ? (completed * 100.0) / totalAssignments
                : 0.0;

        // Calculate average score for completed trainings
        Double averageScore = allTraining.stream()
                .filter(t -> t.getStatus() == TrainingStatus.COMPLETED)
                .filter(t -> t.getScore() != null)
                .mapToInt(EmployeeTraining::getScore)
                .average()
                .orElse(0.0);

        // Group by training program
        Map<String, Long> trainingByProgram = allTraining.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getTrainingProgram().getTitle(),
                        Collectors.counting()
                ));

        return EmployeeAnalyticsDTO.TrainingMetrics.builder()
                .totalAssignments(totalAssignments)
                .notStarted(notStarted)
                .inProgress(inProgress)
                .completed(completed)
                .overdueTraining(overdueTraining)
                .completionRate(completionRate)
                .averageScore(averageScore)
                .trainingByProgram(trainingByProgram)
                .build();
    }

    private EmployeeAnalyticsDTO.CertificationMetrics calculateCertificationMetrics() {
        List<EmployeeCertification> allCertifications = employeeCertificationRepository.findAll();

        // Update statuses before calculating metrics
        allCertifications.forEach(EmployeeCertification::updateStatus);

        long totalCertifications = allCertifications.size();
        long activeCertifications = allCertifications.stream()
                .filter(c -> c.getStatus() == CertificationStatus.ACTIVE)
                .count();
        long expiringSoon = allCertifications.stream()
                .filter(c -> c.getStatus() == CertificationStatus.EXPIRING_SOON)
                .count();
        long expiredCertifications = allCertifications.stream()
                .filter(c -> c.getStatus() == CertificationStatus.EXPIRED)
                .count();
        long pendingVerification = allCertifications.stream()
                .filter(c -> c.getStatus() == CertificationStatus.PENDING)
                .count();

        // Calculate compliance rate
        Double complianceRate = totalCertifications > 0
                ? (activeCertifications * 100.0) / totalCertifications
                : 0.0;

        // Group by certification type
        Map<String, Long> certificationsByType = allCertifications.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCertificationType().getName(),
                        Collectors.counting()
                ));

        return EmployeeAnalyticsDTO.CertificationMetrics.builder()
                .totalCertifications(totalCertifications)
                .activeCertifications(activeCertifications)
                .expiringSoon(expiringSoon)
                .expiredCertifications(expiredCertifications)
                .pendingVerification(pendingVerification)
                .complianceRate(complianceRate)
                .certificationsByType(certificationsByType)
                .build();
    }

    private EmployeeAnalyticsDTO.EmployeeStats calculateEmployeeStats() {
        List<Employee> allEmployees = employeeRepository.findAll();

        long totalEmployees = allEmployees.size();
        long activeEmployees = allEmployees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .count();

        // Count employees with various records
        Set<Long> employeeIdsWithReviews = performanceReviewRepository.findAll().stream()
                .map(r -> r.getEmployee().getId())
                .collect(Collectors.toSet());

        Set<Long> employeeIdsWithTraining = employeeTrainingRepository.findAll().stream()
                .map(t -> t.getEmployee().getId())
                .collect(Collectors.toSet());

        Set<Long> employeeIdsWithCertifications = employeeCertificationRepository.findAll().stream()
                .map(c -> c.getEmployee().getId())
                .collect(Collectors.toSet());

        return EmployeeAnalyticsDTO.EmployeeStats.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .employeesWithReviews((long) employeeIdsWithReviews.size())
                .employeesWithTraining((long) employeeIdsWithTraining.size())
                .employeesWithCertifications((long) employeeIdsWithCertifications.size())
                .build();
    }
}
