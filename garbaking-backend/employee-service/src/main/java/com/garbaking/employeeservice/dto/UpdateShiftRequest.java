package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.ShiftStatus;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request DTO for updating an existing shift
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShiftRequest {

    @Positive(message = "Employee ID must be positive")
    private Long employeeId;

    @Positive(message = "Position ID must be positive")
    private Long positionId;

    private LocalDate shiftDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @PositiveOrZero(message = "Break minutes cannot be negative")
    private Integer breakMinutes;

    private ShiftStatus status;

    private String location;

    private String notes;

    private String managerNotes;
}
