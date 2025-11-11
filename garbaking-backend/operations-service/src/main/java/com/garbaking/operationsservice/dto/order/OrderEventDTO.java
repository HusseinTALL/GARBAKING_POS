package com.garbaking.operationsservice.dto.order;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Order Event DTO - Receives order events from order-service via Kafka
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderEventDTO {

    private Long id;
    private String orderNumber;
    private String status;           // PENDING, CONFIRMED, PREPARING, READY, OUT_FOR_DELIVERY, COMPLETED, CANCELLED
    private String orderType;        // DINE_IN, TAKEAWAY, DELIVERY
    private Long userId;
    
    // Customer info
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    
    // Pricing
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    
    // Payment fields
    private String paymentStatus;    // PENDING, PAID, FAILED, REFUNDED
    private String paymentMethod;    // CASH, CARD, MOBILE_MONEY, BANK_TRANSFER, ONLINE
    private String transactionId;    // External transaction reference
    private LocalDateTime paidAt;
    
    // QR Payment fields
    private String qrTokenId;
    private LocalDateTime qrPaymentConfirmedAt;
    private Long qrConfirmedByUserId;
    private String qrConfirmedByDeviceId;
    
    // Delivery
    private String deliveryAddress;
    private String tableNumber;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
}
