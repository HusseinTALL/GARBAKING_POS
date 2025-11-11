package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.TimeEntryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for TimeEntry
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntryDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private LocalDateTime clockInTime;
    private LocalDateTime clockOutTime;
    private Integer breakMinutes;
    private BigDecimal totalHours;
    private BigDecimal overtimeHours;
    private String location;
    private String ipAddress;
    private String notes;
    private TimeEntryStatus status;
    private Long approvedBy;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
    private BigDecimal currentHours;
}
