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

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Position entity representing job titles and roles
 */
@Entity
@Table(name = "positions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Position title is required")
    @Column(nullable = false, unique = true)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @NotNull(message = "Pay type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "pay_type", nullable = false)
    private PayType payType;

    @Column(name = "base_pay_rate", precision = 10, scale = 2)
    private BigDecimal basePayRate;

    @Column(name = "min_pay_rate", precision = 10, scale = 2)
    private BigDecimal minPayRate;

    @Column(name = "max_pay_rate", precision = 10, scale = 2)
    private BigDecimal maxPayRate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "requires_certification")
    private Boolean requiresCertification = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
