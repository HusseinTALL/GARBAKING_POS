package com.garbaking.employeeservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Employee Certification entity for tracking employee certifications with expiration
 */
@Entity
@Table(name = "employee_certifications", indexes = {
        @Index(name = "idx_employee_cert", columnList = "employee_id, certification_type_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_expiration", columnList = "expiration_date")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCertification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "certification_type_id", nullable = false)
    private CertificationType certificationType;

    @Column(name = "certification_number", length = 100)
    private String certificationNumber;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CertificationStatus status;

    @Column(name = "verified_by")
    private Long verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Check if certification is expired
     */
    public boolean isExpired() {
        return expirationDate != null && LocalDate.now().isAfter(expirationDate);
    }

    /**
     * Check if certification is expiring soon (within 30 days)
     */
    public boolean isExpiringSoon() {
        if (expirationDate == null || isExpired()) {
            return false;
        }
        long daysUntilExpiration = ChronoUnit.DAYS.between(LocalDate.now(), expirationDate);
        return daysUntilExpiration <= 30;
    }

    /**
     * Get days until expiration
     */
    public Long getDaysUntilExpiration() {
        if (expirationDate == null) {
            return null;
        }
        return ChronoUnit.DAYS.between(LocalDate.now(), expirationDate);
    }

    /**
     * Update status based on expiration date
     */
    public void updateStatus() {
        if (status == CertificationStatus.REVOKED || status == CertificationStatus.PENDING) {
            return; // Don't auto-update these statuses
        }

        if (isExpired()) {
            this.status = CertificationStatus.EXPIRED;
        } else if (isExpiringSoon()) {
            this.status = CertificationStatus.EXPIRING_SOON;
        } else {
            this.status = CertificationStatus.ACTIVE;
        }
    }

    /**
     * Verify the certification
     */
    public void verify(Long verifierId) {
        this.status = CertificationStatus.ACTIVE;
        this.verifiedBy = verifierId;
        this.verifiedAt = LocalDateTime.now();
    }

    /**
     * Revoke the certification
     */
    public void revoke(String reason) {
        this.status = CertificationStatus.REVOKED;
        this.notes = (this.notes != null ? this.notes + "\n" : "") + "Revoked: " + reason;
    }
}
