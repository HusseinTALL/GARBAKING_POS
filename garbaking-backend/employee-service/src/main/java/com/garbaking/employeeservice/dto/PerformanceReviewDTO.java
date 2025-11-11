package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Performance Review
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReviewDTO {

    private Long id;

    // Employee information
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;

    // Reviewer information
    private Long reviewerId;
    private String reviewerName;

    private LocalDate reviewDate;
    private LocalDate reviewPeriodStart;
    private LocalDate reviewPeriodEnd;
    private ReviewStatus status;

    // Performance ratings (1-5)
    private Integer qualityOfWork;
    private Integer productivity;
    private Integer attendancePunctuality;
    private Integer teamwork;
    private Integer communication;
    private Integer customerService;
    private Integer initiative;
    private Integer leadership;

    private Double overallRating;

    private String strengths;
    private String areasForImprovement;
    private String goals;
    private String reviewerComments;
    private String employeeComments;

    private LocalDateTime acknowledgedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
