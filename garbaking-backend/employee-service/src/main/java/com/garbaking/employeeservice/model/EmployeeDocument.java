package com.garbaking.employeeservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Employee Document entity for storing employee-related documents
 */
@Entity
@Table(name = "employee_documents", indexes = {
    @Index(name = "idx_employee", columnList = "employee_id"),
    @Index(name = "idx_document_type", columnList = "document_type"),
    @Index(name = "idx_expiry_date", columnList = "expiry_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class EmployeeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull(message = "Employee is required")
    private Employee employee;

    @NotNull(message = "Document type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @NotBlank(message = "Document name is required")
    @Column(name = "document_name", nullable = false)
    private String documentName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "File path is required")
    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @Column(name = "is_confidential")
    private Boolean isConfidential = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public boolean isExpired() {
        if (expiryDate == null) return false;
        return LocalDate.now().isAfter(expiryDate);
    }

    public boolean isExpiringSoon(int daysThreshold) {
        if (expiryDate == null) return false;
        LocalDate thresholdDate = LocalDate.now().plusDays(daysThreshold);
        return expiryDate.isBefore(thresholdDate) && !isExpired();
    }
}
