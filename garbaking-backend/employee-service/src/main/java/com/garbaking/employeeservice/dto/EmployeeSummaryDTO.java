package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.EmployeeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for Employee summary (lightweight version for lists)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSummaryDTO {
    private Long id;
    private String employeeNumber;
    private String fullName;
    private String email;
    private String phone;
    private String positionTitle;
    private String departmentName;
    private EmployeeStatus status;
    private LocalDate hireDate;
    private String profilePictureUrl;
}
