package com.garbaking.employeeservice.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for creating a performance review
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePerformanceReviewRequest {

    @NotNull(message = "Employee ID is required")
    @Positive(message = "Employee ID must be positive")
    private Long employeeId;

    @NotNull(message = "Reviewer ID is required")
    @Positive(message = "Reviewer ID must be positive")
    private Long reviewerId;

    @NotNull(message = "Review date is required")
    private LocalDate reviewDate;

    @NotNull(message = "Review period start date is required")
    private LocalDate reviewPeriodStart;

    @NotNull(message = "Review period end date is required")
    private LocalDate reviewPeriodEnd;

    // Performance ratings (1-5)
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer qualityOfWork;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer productivity;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer attendancePunctuality;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer teamwork;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer communication;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer customerService;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer initiative;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer leadership;

    private String strengths;
    private String areasForImprovement;
    private String goals;
    private String reviewerComments;
}
