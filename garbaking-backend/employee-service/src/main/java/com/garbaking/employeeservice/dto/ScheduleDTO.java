package com.garbaking.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DTO for Schedule calendar view
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleDTO {

    private LocalDate startDate;
    private LocalDate endDate;

    // All shifts in the period
    private List<ShiftDTO> shifts;

    // Shifts grouped by date
    private Map<LocalDate, List<ShiftDTO>> shiftsByDate;

    // Shifts grouped by employee
    private Map<Long, List<ShiftDTO>> shiftsByEmployee;

    // Summary statistics
    private Integer totalShifts;
    private Integer totalEmployees;
    private Double totalScheduledHours;

    // Staffing coverage by date
    private Map<LocalDate, Integer> staffingByDate;

    // Unassigned shifts
    private List<ShiftDTO> unassignedShifts;
}
