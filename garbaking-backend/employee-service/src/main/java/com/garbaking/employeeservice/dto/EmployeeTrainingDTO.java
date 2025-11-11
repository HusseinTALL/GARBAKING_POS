package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.TrainingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Employee Training
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeTrainingDTO {

    private Long id;

    private Long employeeId;
    private String employeeName;
    private String employeeNumber;

    private Long trainingProgramId;
    private String trainingProgramTitle;
    private Integer durationHours;

    private TrainingStatus status;
    private LocalDate assignedDate;
    private LocalDate startDate;
    private LocalDate completionDate;
    private LocalDate dueDate;
    private Boolean isOverdue;

    private Integer score;
    private String trainerName;
    private String notes;
    private String certificateUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
