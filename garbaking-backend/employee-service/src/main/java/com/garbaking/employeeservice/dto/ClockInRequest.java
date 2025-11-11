package com.garbaking.employeeservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request DTO for clock in
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClockInRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private LocalDateTime clockInTime; // Optional, defaults to now

    private String location;

    private String notes;
}
