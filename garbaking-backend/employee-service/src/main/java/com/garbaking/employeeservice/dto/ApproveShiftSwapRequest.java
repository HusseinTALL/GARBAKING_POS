package com.garbaking.employeeservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for manager approval of shift swap
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveShiftSwapRequest {

    @NotNull(message = "Swap request ID is required")
    @Positive(message = "Swap request ID must be positive")
    private Long swapRequestId;

    @NotNull(message = "Manager ID is required")
    @Positive(message = "Manager ID must be positive")
    private Long managerId;

    private String approvalNotes;
}
