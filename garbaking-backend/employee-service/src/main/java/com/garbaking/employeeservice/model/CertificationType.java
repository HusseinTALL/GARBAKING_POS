package com.garbaking.employeeservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Certification Type entity for defining types of certifications
 */
@Entity
@Table(name = "certification_types", indexes = {
        @Index(name = "idx_active", columnList = "is_active")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificationType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name; // e.g., "Food Handler", "Alcohol Service", "First Aid"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "issuing_organization", length = 200)
    private String issuingOrganization;

    @Column(name = "validity_months")
    private Integer validityMonths; // How many months before expiration

    @Column(name = "is_mandatory")
    private Boolean isMandatory;

    @Column(name = "is_active")
    private Boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "required_for_position_id")
    private Position requiredForPosition; // Optional: certification required for specific position

    @Column(name = "renewal_required")
    private Boolean renewalRequired;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
