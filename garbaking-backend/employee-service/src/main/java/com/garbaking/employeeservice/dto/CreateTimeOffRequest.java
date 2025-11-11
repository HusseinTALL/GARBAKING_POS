package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.TimeOffType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for creating time off request
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTimeOffRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Time off type is required")
    private TimeOffType timeOffType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private String reason;
}
