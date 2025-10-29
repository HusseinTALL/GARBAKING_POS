package com.garbaking.operationsservice.model;

import java.math.BigDecimal;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {

    private Long id;
    private String orderId;
    private BigDecimal amount;
    private String paymentMethod;
    private PaymentStatus status;
    private Instant processedAt;
    private BigDecimal tipAmount;
    private String reference;
}
