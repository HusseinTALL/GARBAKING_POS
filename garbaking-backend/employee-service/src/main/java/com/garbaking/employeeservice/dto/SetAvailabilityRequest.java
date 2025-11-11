package com.garbaking.employeeservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Request DTO for setting employee availability
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetAvailabilityRequest {

    @NotNull(message = "Employee ID is required")
    @Positive(message = "Employee ID must be positive")
    private Long employeeId;

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;

    // Optional time range (null means available all day)
    private LocalTime startTime;

    private LocalTime endTime;

    private String notes;
}
