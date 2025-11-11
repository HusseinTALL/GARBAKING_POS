package com.garbaking.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Attendance
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private LocalDate attendanceDate;
    private Boolean isPresent;
    private Boolean isLate;
    private Boolean isAbsent;
    private Boolean isOnLeave;
    private LocalDateTime clockInTime;
    private LocalDateTime clockOutTime;
    private BigDecimal totalHours;
    private BigDecimal overtimeHours;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
