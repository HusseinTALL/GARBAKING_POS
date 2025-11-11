package com.garbaking.employeeservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for responding to a shift swap request (accept/reject)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespondToShiftSwapRequest {

    @NotNull(message = "Swap request ID is required")
    @Positive(message = "Swap request ID must be positive")
    private Long swapRequestId;

    @NotNull(message = "Employee ID is required")
    @Positive(message = "Employee ID must be positive")
    private Long employeeId;

    @NotNull(message = "Accept status is required")
    private Boolean accept;

    @NotBlank(message = "Response message is required")
    private String responseMessage;
}
