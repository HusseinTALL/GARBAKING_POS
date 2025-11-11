package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.CreatePerformanceReviewRequest;
import com.garbaking.employeeservice.dto.PerformanceReviewDTO;
import com.garbaking.employeeservice.model.*;
import com.garbaking.employeeservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Performance Review operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PerformanceReviewService {

    private final PerformanceReviewRepository reviewRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public PerformanceReviewDTO createReview(CreatePerformanceReviewRequest request) {
        log.info("Creating performance review for employee {}", request.getEmployeeId());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found: " + request.getEmployeeId()));

        Employee reviewer = employeeRepository.findById(request.getReviewerId())
                .orElseThrow(() -> new RuntimeException("Reviewer not found: " + request.getReviewerId()));

        // Validate dates
        if (request.getReviewPeriodStart().isAfter(request.getReviewPeriodEnd())) {
            throw new RuntimeException("Review period start date must be before end date");
        }

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewDate(request.getReviewDate())
                .reviewPeriodStart(request.getReviewPeriodStart())
                .reviewPeriodEnd(request.getReviewPeriodEnd())
                .status(ReviewStatus.DRAFT)
                .qualityOfWork(request.getQualityOfWork())
                .productivity(request.getProductivity())
                .attendancePunctuality(request.getAttendancePunctuality())
                .teamwork(request.getTeamwork())
                .communication(request.getCommunication())
                .customerService(request.getCustomerService())
                .initiative(request.getInitiative())
                .leadership(request.getLeadership())
                .strengths(request.getStrengths())
                .areasForImprovement(request.getAreasForImprovement())
                .goals(request.getGoals())
                .reviewerComments(request.getReviewerComments())
                .build();

        review.calculateOverallRating();
        PerformanceReview savedReview = reviewRepository.save(review);

        log.info("Performance review created successfully: {}", savedReview.getId());
        return convertToDTO(savedReview);
    }

    @Transactional
    public PerformanceReviewDTO completeReview(Long reviewId) {
        log.info("Completing review: {}", reviewId);

        PerformanceReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));

        review.complete();
        PerformanceReview savedReview = reviewRepository.save(review);

        return convertToDTO(savedReview);
    }

    @Transactional
    public PerformanceReviewDTO acknowledgeReview(Long reviewId, String employeeComments) {
        log.info("Employee acknowledging review: {}", reviewId);

        PerformanceReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));

        if (employeeComments != null) {
            review.setEmployeeComments(employeeComments);
        }

        review.acknowledge();
        PerformanceReview savedReview = reviewRepository.save(review);

        return convertToDTO(savedReview);
    }

    @Transactional(readOnly = true)
    public PerformanceReviewDTO getReviewById(Long reviewId) {
        PerformanceReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));

        return convertToDTO(review);
    }

    @Transactional(readOnly = true)
    public List<PerformanceReviewDTO> getReviewsByEmployee(Long employeeId) {
        List<PerformanceReview> reviews = reviewRepository.findByEmployeeId(employeeId);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PerformanceReviewDTO> getReviewsByStatus(ReviewStatus status) {
        List<PerformanceReview> reviews = reviewRepository.findByStatusOrderByReviewDateDesc(status);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PerformanceReviewDTO> getRecentReviews() {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<PerformanceReview> reviews = reviewRepository.findRecentReviews(thirtyDaysAgo);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Double getAverageRatingForEmployee(Long employeeId) {
        return reviewRepository.getAverageRatingByEmployeeId(employeeId);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        log.info("Deleting review: {}", reviewId);

        PerformanceReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));

        if (review.getStatus() == ReviewStatus.COMPLETED || review.getStatus() == ReviewStatus.ACKNOWLEDGED) {
            throw new RuntimeException("Cannot delete completed or acknowledged reviews");
        }

        reviewRepository.delete(review);
    }

    private PerformanceReviewDTO convertToDTO(PerformanceReview review) {
        return PerformanceReviewDTO.builder()
                .id(review.getId())
                .employeeId(review.getEmployee().getId())
                .employeeName(review.getEmployee().getFullName())
                .employeeNumber(review.getEmployee().getEmployeeNumber())
                .reviewerId(review.getReviewer().getId())
                .reviewerName(review.getReviewer().getFullName())
                .reviewDate(review.getReviewDate())
                .reviewPeriodStart(review.getReviewPeriodStart())
                .reviewPeriodEnd(review.getReviewPeriodEnd())
                .status(review.getStatus())
                .qualityOfWork(review.getQualityOfWork())
                .productivity(review.getProductivity())
                .attendancePunctuality(review.getAttendancePunctuality())
                .teamwork(review.getTeamwork())
                .communication(review.getCommunication())
                .customerService(review.getCustomerService())
                .initiative(review.getInitiative())
                .leadership(review.getLeadership())
                .overallRating(review.getOverallRating())
                .strengths(review.getStrengths())
                .areasForImprovement(review.getAreasForImprovement())
                .goals(review.getGoals())
                .reviewerComments(review.getReviewerComments())
                .employeeComments(review.getEmployeeComments())
                .acknowledgedAt(review.getAcknowledgedAt())
                .completedAt(review.getCompletedAt())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
