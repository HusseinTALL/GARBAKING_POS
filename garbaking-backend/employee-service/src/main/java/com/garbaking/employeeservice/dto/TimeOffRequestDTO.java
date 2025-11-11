package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.TimeOffRequestStatus;
import com.garbaking.employeeservice.model.TimeOffType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for TimeOffRequest
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeOffRequestDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private TimeOffType timeOffType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private String reason;
    private TimeOffRequestStatus status;
    private Long reviewedBy;
    private String reviewerName;
    private LocalDateTime reviewedAt;
    private String reviewNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
    private Boolean isInFuture;
}
