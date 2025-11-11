package com.garbaking.employeeservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

/**
 * Employee entity representing employee profiles and information
 */
@Entity
@Table(name = "employees", indexes = {
    @Index(name = "idx_employee_number", columnList = "employee_number", unique = true),
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_position", columnList = "position_id"),
    @Index(name = "idx_department", columnList = "department_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Employee number is required")
    @Column(name = "employee_number", nullable = false, unique = true)
    private String employeeNumber;

    @NotBlank(message = "First name is required")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Email(message = "Email should be valid")
    @Column(unique = true)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "country")
    private String country;

    // Employment Information
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "position_id")
    @NotNull(message = "Position is required")
    private Position position;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @NotNull(message = "Hire date is required")
    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "termination_date")
    private LocalDate terminationDate;

    @NotNull(message = "Employee status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    // Compensation
    @NotNull(message = "Pay type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "pay_type", nullable = false)
    private PayType payType;

    @Column(name = "pay_rate", precision = 10, scale = 2)
    private BigDecimal payRate;

    // Emergency Contact
    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relationship")
    private String emergencyContactRelationship;

    // System Integration
    @Column(name = "user_id")
    private Long userId;  // Link to user-service for authentication

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Computed fields
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public int getYearsOfService() {
        if (hireDate == null) return 0;
        LocalDate endDate = (terminationDate != null) ? terminationDate : LocalDate.now();
        return Period.between(hireDate, endDate).getYears();
    }

    public boolean isActive() {
        return status == EmployeeStatus.ACTIVE;
    }

    public boolean isTerminated() {
        return status == EmployeeStatus.TERMINATED || status == EmployeeStatus.RETIRED;
    }
}
