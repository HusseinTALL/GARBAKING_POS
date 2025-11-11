package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.EmployeeStatus;
import com.garbaking.employeeservice.model.PayType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating a new employee
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Email should be valid")
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
    @NotNull(message = "Position ID is required")
    private Long positionId;

    private Long departmentId;

    @NotNull(message = "Hire date is required")
    private LocalDate hireDate;

    @NotNull(message = "Status is required")
    private EmployeeStatus status;

    // Compensation
    @NotNull(message = "Pay type is required")
    private PayType payType;

    private BigDecimal payRate;

    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;

    // System
    private Long userId;
    private String notes;
}
