package com.garbaking.orderservice.dto;

import com.garbaking.orderservice.model.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Data Transfer Object
 *
 * Used for order responses with full details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {

    private Long id;
    private String orderNumber;
    private Order.OrderStatus status;
    private Order.OrderType orderType;

    // Customer Information
    private Long userId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Order Items
    @Builder.Default
    private List<OrderItemDTO> items = new ArrayList<>();

    // Pricing
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;

    // Payment Information
    private Order.PaymentStatus paymentStatus;
    private Order.PaymentMethod paymentMethod;
    private String transactionId;
    private LocalDateTime paidAt;

    // Delivery Information
    private String deliveryAddress;
    private String deliveryInstructions;
    private BigDecimal deliveryFee;

    // Additional Information
    private String notes;
    private String tableNumber;
    private Integer estimatedPreparationTime;
    private LocalDateTime scheduledFor;

    // Timestamps
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
