package com.garbaking.employeeservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a shift swap request
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateShiftSwapRequest {

    @NotNull(message = "Requester ID is required")
    @Positive(message = "Requester ID must be positive")
    private Long requesterId;

    @NotNull(message = "Requester shift ID is required")
    @Positive(message = "Requester shift ID must be positive")
    private Long requesterShiftId;

    // Optional - if not provided, this is an open swap request
    @Positive(message = "Target employee ID must be positive")
    private Long targetEmployeeId;

    // Optional - specific shift to swap with
    @Positive(message = "Target shift ID must be positive")
    private Long targetShiftId;

    private String requestMessage;
}
