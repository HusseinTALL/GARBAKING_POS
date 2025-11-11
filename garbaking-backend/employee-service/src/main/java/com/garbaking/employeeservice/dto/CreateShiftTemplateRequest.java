package com.garbaking.employeeservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Request DTO for creating a shift template
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateShiftTemplateRequest {

    @NotBlank(message = "Template name is required")
    private String templateName;

    private String description;

    @NotNull(message = "Position ID is required")
    @Positive(message = "Position ID must be positive")
    private Long positionId;

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @PositiveOrZero(message = "Break minutes cannot be negative")
    private Integer breakMinutes = 30;

    @Positive(message = "Required staff must be at least 1")
    private Integer requiredStaff = 1;

    private String location;
}
