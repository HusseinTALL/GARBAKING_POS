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
@Table(name = "cash_drawer_sessions", indexes = {
    @Index(name = "idx_cash_drawer_id", columnList = "cash_drawer_id"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_opened_at", columnList = "opened_at"),
    @Index(name = "idx_status", columnList = "status")
})
public class CashDrawerSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cash_drawer_id", nullable = false)
    private Long cashDrawerId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "starting_cash", nullable = false, precision = 10, scale = 2)
    private BigDecimal startingCash;

    @Column(name = "ending_cash", precision = 10, scale = 2)
    private BigDecimal endingCash;

    @Column(name = "expected_cash", precision = 10, scale = 2)
    private BigDecimal expectedCash;

    @Column(name = "variance", precision = 10, scale = 2)
    private BigDecimal variance;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private SessionStatus status = SessionStatus.OPEN;

    @Column(name = "opened_at", nullable = false)
    @Builder.Default
    private Instant openedAt = Instant.now();

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (openedAt == null) {
            openedAt = Instant.now();
        }
    }
}
