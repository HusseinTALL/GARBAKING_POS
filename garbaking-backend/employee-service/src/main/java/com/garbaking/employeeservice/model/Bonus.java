package com.garbaking.employeeservice.model;

import jakarta.persistence.*;
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

/**
 * Bonus entity for tracking employee bonuses
 */
@Entity
@Table(name = "bonuses", indexes = {
        @Index(name = "idx_payroll_entry", columnList = "payroll_entry_id"),
        @Index(name = "idx_employee", columnList = "employee_id"),
        @Index(name = "idx_bonus_date", columnList = "bonus_date")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bonus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_entry_id")
    private PayrollEntry payrollEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "bonus_type", nullable = false, length = 30)
    private BonusType bonusType;

    @Column(nullable = false, length = 100)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "bonus_date", nullable = false)
    private LocalDate bonusDate;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "is_paid")
    private Boolean isPaid;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Approve the bonus
     */
    public void approve(Long approverId) {
        this.approvedBy = approverId;
        this.approvedAt = LocalDateTime.now();
    }

    /**
     * Mark bonus as paid
     */
    public void markPaid() {
        this.isPaid = true;
    }
}
