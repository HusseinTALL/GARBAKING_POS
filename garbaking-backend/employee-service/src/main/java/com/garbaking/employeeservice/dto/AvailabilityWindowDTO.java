package com.garbaking.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO for Employee Availability Window information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityWindowDTO {

    private Long id;

    // Employee information
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;

    // Availability details
    private DayOfWeek dayOfWeek;
    private Boolean isAvailable;
    private LocalTime startTime;
    private LocalTime endTime;

    private String notes;

    private Boolean isActive;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
