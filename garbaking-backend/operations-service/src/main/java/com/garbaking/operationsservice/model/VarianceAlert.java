package com.garbaking.operationsservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Alert for significant cash variances requiring investigation
 */
@Entity
@Table(name = "variance_alerts", indexes = {
    @Index(name = "idx_session_id", columnList = "session_id"),
    @Index(name = "idx_severity", columnList = "severity"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_resolved", columnList = "resolved")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VarianceAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private CashDrawerSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciliation_id", nullable = false)
    private CashReconciliation reconciliation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "variance_status", nullable = false, length = 20)
    private ReconciliationStatus varianceStatus;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal variance;

    @Column(name = "variance_percentage", precision = 10, scale = 4)
    private BigDecimal variancePercentage;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal threshold;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(length = 1000)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean acknowledged = false;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "acknowledged_by")
    private Long acknowledgedBy;

    @Column(nullable = false)
    private Boolean resolved = false;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by")
    private Long resolvedBy;

    @Column(name = "resolution_notes", length = 2000)
    private String resolutionNotes;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (acknowledged == null) {
            acknowledged = false;
        }
        if (resolved == null) {
            resolved = false;
        }
    }
}
