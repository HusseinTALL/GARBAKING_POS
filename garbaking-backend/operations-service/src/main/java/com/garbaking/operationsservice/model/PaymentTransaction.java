package com.garbaking.operationsservice.model;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payment_transactions", indexes = {
    @Index(name = "idx_order_id", columnList = "order_id"),
    @Index(name = "idx_cash_drawer_session_id", columnList = "cash_drawer_session_id"),
    @Index(name = "idx_processed_at", columnList = "processed_at")
})
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", unique = true, length = 50)
    private String reference;

    @Column(name = "order_id", length = 50)
    private String orderId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_method", length = 20)
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentStatus status;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "tip_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal tipAmount = BigDecimal.ZERO;

    @Column(name = "cash_drawer_session_id")
    private Long cashDrawerSessionId;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (processedAt == null) {
            processedAt = Instant.now();
        }
    }
}
