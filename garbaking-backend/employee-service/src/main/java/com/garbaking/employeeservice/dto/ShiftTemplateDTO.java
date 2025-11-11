package com.garbaking.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO for Shift Template information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftTemplateDTO {

    private Long id;

    private String templateName;

    private String description;

    // Position information
    private Long positionId;
    private String positionTitle;

    // Schedule details
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer breakMinutes;

    // Staffing
    private Integer requiredStaff;

    private String location;

    private Boolean isActive;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
