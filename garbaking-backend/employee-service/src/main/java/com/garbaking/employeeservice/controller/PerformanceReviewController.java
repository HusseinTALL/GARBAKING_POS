package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.CreatePerformanceReviewRequest;
import com.garbaking.employeeservice.dto.PerformanceReviewDTO;
import com.garbaking.employeeservice.model.ReviewStatus;
import com.garbaking.employeeservice.service.PerformanceReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Performance Review operations
 */
@RestController
@RequestMapping("/api/employees/performance-reviews")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class PerformanceReviewController {

    private final PerformanceReviewService reviewService;

    @PostMapping
    public ResponseEntity<PerformanceReviewDTO> createReview(
            @Valid @RequestBody CreatePerformanceReviewRequest request
    ) {
        log.info("POST /api/employees/performance-reviews - Employee: {}", request.getEmployeeId());
        PerformanceReviewDTO review = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @PostMapping("/{reviewId}/complete")
    public ResponseEntity<PerformanceReviewDTO> completeReview(@PathVariable Long reviewId) {
        log.info("POST /api/employees/performance-reviews/{}/complete", reviewId);
        PerformanceReviewDTO review = reviewService.completeReview(reviewId);
        return ResponseEntity.ok(review);
    }

    @PostMapping("/{reviewId}/acknowledge")
    public ResponseEntity<PerformanceReviewDTO> acknowledgeReview(
            @PathVariable Long reviewId,
            @RequestParam(required = false) String employeeComments
    ) {
        log.info("POST /api/employees/performance-reviews/{}/acknowledge", reviewId);
        PerformanceReviewDTO review = reviewService.acknowledgeReview(reviewId, employeeComments);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<PerformanceReviewDTO> getReviewById(@PathVariable Long reviewId) {
        log.info("GET /api/employees/performance-reviews/{}", reviewId);
        PerformanceReviewDTO review = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PerformanceReviewDTO>> getReviewsByEmployee(
            @PathVariable Long employeeId
    ) {
        log.info("GET /api/employees/performance-reviews/employee/{}", employeeId);
        List<PerformanceReviewDTO> reviews = reviewService.getReviewsByEmployee(employeeId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PerformanceReviewDTO>> getReviewsByStatus(
            @PathVariable ReviewStatus status
    ) {
        log.info("GET /api/employees/performance-reviews/status/{}", status);
        List<PerformanceReviewDTO> reviews = reviewService.getReviewsByStatus(status);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<PerformanceReviewDTO>> getRecentReviews() {
        log.info("GET /api/employees/performance-reviews/recent");
        List<PerformanceReviewDTO> reviews = reviewService.getRecentReviews();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/employee/{employeeId}/average-rating")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long employeeId) {
        log.info("GET /api/employees/performance-reviews/employee/{}/average-rating", employeeId);
        Double avgRating = reviewService.getAverageRatingForEmployee(employeeId);
        return ResponseEntity.ok(avgRating);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        log.info("DELETE /api/employees/performance-reviews/{}", reviewId);
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
