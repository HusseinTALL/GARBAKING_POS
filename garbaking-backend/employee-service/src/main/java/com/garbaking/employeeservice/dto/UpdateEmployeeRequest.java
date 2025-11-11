package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.EmployeeStatus;
import com.garbaking.employeeservice.model.PayType;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for updating an employee
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeRequest {

    private String firstName;
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
    private Long positionId;
    private Long departmentId;
    private LocalDate terminationDate;
    private EmployeeStatus status;

    // Compensation
    private PayType payType;
    private BigDecimal payRate;

    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;

    private String profilePictureUrl;
    private String notes;
}
