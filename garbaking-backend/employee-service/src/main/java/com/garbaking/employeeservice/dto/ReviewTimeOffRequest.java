package com.garbaking.employeeservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for reviewing time off request
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewTimeOffRequest {

    @NotNull(message = "Time off request ID is required")
    private Long timeOffRequestId;

    @NotNull(message = "Reviewer ID is required")
    private Long reviewerId;

    @NotNull(message = "Approved status is required")
    private Boolean approved;

    private String notes;
}
