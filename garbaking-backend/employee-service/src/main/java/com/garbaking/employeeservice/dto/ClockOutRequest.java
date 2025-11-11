package com.garbaking.employeeservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request DTO for clock out
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClockOutRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private LocalDateTime clockOutTime; // Optional, defaults to now

    private Integer breakMinutes;

    private String notes;
}
