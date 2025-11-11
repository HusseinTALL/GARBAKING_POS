package com.garbaking.operationsservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cash_reconciliations")
public class CashReconciliation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private CashDrawerSession session;

    @Column(name = "expected_cash", nullable = false, precision = 10, scale = 2)
    private BigDecimal expectedCash;

    @Column(name = "counted_cash", nullable = false, precision = 10, scale = 2)
    private BigDecimal countedCash;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal variance;

    @Column(name = "variance_reason", columnDefinition = "TEXT")
    private String varianceReason;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReconciliationStatus status;

    @Column(name = "reconciled_at", nullable = false)
    @Builder.Default
    private Instant reconciledAt = Instant.now();

    @Column(name = "reconciled_by")
    private Long reconciledBy;

    @PrePersist
    protected void onCreate() {
        if (reconciledAt == null) {
            reconciledAt = Instant.now();
        }
        // Calculate variance if not set
        if (variance == null && expectedCash != null && countedCash != null) {
            variance = countedCash.subtract(expectedCash);
        }
        // Determine status based on variance
        if (status == null && variance != null) {
            if (variance.compareTo(BigDecimal.ZERO) == 0) {
                status = ReconciliationStatus.BALANCED;
            } else if (variance.compareTo(BigDecimal.ZERO) < 0) {
                status = ReconciliationStatus.SHORT;
            } else {
                status = ReconciliationStatus.OVER;
            }
        }
    }
}
