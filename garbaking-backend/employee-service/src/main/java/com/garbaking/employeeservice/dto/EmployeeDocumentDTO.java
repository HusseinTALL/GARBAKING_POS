package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for EmployeeDocument
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocumentDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private DocumentType documentType;
    private String documentName;
    private String description;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String uploadedBy;
    private Boolean isConfidential;
    private Boolean isExpired;
    private Boolean isExpiringSoon;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
