package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.GoalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Performance Goal
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceGoalDTO {

    private Long id;

    private Long employeeId;
    private String employeeName;
    private String employeeNumber;

    private Long createdById;
    private String createdByName;

    private String title;
    private String description;
    private GoalStatus status;

    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalDate completedDate;

    private Integer progressPercentage;
    private Boolean isOverdue;

    private String notes;
    private String completionNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
