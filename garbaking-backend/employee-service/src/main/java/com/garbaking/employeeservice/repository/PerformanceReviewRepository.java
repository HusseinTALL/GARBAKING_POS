package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.PerformanceReview;
import com.garbaking.employeeservice.model.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for Performance Review operations
 */
@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {

    /**
     * Find all reviews for an employee
     */
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.employee.id = :employeeId " +
            "ORDER BY pr.reviewDate DESC")
    List<PerformanceReview> findByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Find all reviews by a reviewer
     */
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.reviewer.id = :reviewerId " +
            "ORDER BY pr.reviewDate DESC")
    List<PerformanceReview> findByReviewerId(@Param("reviewerId") Long reviewerId);

    /**
     * Find reviews by status
     */
    List<PerformanceReview> findByStatusOrderByReviewDateDesc(ReviewStatus status);

    /**
     * Find reviews within a date range
     */
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.reviewDate BETWEEN :startDate AND :endDate " +
            "ORDER BY pr.reviewDate DESC")
    List<PerformanceReview> findByReviewDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find reviews for an employee within a date range
     */
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.employee.id = :employeeId " +
            "AND pr.reviewDate BETWEEN :startDate AND :endDate " +
            "ORDER BY pr.reviewDate DESC")
    List<PerformanceReview> findByEmployeeIdAndDateRange(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find recent reviews (last 30 days)
     */
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.reviewDate >= :date " +
            "ORDER BY pr.reviewDate DESC")
    List<PerformanceReview> findRecentReviews(@Param("date") LocalDate date);

    /**
     * Count reviews by status
     */
    Long countByStatus(ReviewStatus status);

    /**
     * Get average overall rating for an employee
     */
    @Query("SELECT AVG(pr.overallRating) FROM PerformanceReview pr " +
            "WHERE pr.employee.id = :employeeId AND pr.status = 'COMPLETED'")
    Double getAverageRatingByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Find pending acknowledgements for an employee
     */
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.employee.id = :employeeId " +
            "AND pr.status = 'COMPLETED' ORDER BY pr.completedAt DESC")
    List<PerformanceReview> findPendingAcknowledgements(@Param("employeeId") Long employeeId);
}
