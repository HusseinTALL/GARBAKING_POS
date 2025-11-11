package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.CertificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Employee Certification
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCertificationDTO {

    private Long id;

    private Long employeeId;
    private String employeeName;
    private String employeeNumber;

    private Long certificationTypeId;
    private String certificationTypeName;
    private String issuingOrganization;

    private String certificationNumber;
    private LocalDate issueDate;
    private LocalDate expirationDate;
    private CertificationStatus status;

    private Long daysUntilExpiration;
    private Boolean isExpired;
    private Boolean isExpiringSoon;

    private Long verifiedBy;
    private String verifiedByName;
    private LocalDateTime verifiedAt;

    private String certificateUrl;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
