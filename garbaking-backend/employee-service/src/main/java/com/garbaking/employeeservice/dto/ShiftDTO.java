package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.ShiftStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO for Shift information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftDTO {

    private Long id;

    // Employee information
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;

    // Position information
    private Long positionId;
    private String positionTitle;

    // Shift details
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer breakMinutes;
    private ShiftStatus status;

    // Additional information
    private String location;
    private String notes;
    private String managerNotes;

    // Calculated fields
    private Double shiftHours;
    private Boolean isToday;
    private Boolean isUpcoming;
    private Boolean isPast;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
