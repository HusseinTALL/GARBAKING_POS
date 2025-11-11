package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.EmployeeStatus;
import com.garbaking.employeeservice.model.PayType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Employee
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String employeeNumber;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;

    // Address
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    // Employment
    private Long positionId;
    private String positionTitle;
    private Long departmentId;
    private String departmentName;
    private LocalDate hireDate;
    private LocalDate terminationDate;
    private EmployeeStatus status;
    private Integer yearsOfService;

    // Compensation
    private PayType payType;
    private BigDecimal payRate;

    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;

    // System
    private Long userId;
    private String profilePictureUrl;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
