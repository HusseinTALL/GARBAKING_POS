package com.garbaking.orderservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Entity
 *
 * Represents a customer order in the system.
 */
@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_number", columnList = "orderNumber"),
        @Index(name = "idx_order_status", columnList = "status"),
        @Index(name = "idx_order_user", columnList = "userId"),
        @Index(name = "idx_order_type", columnList = "orderType"),
        @Index(name = "idx_order_payment_status", columnList = "paymentStatus"),
        @Index(name = "idx_order_created_at", columnList = "createdAt"),
        @Index(name = "idx_order_user_created", columnList = "userId, createdAt")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String orderNumber;  // e.g., "ORD-20250126-0001"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderType orderType;

    // User/Customer Information
    @Column(nullable = false)
    private Long userId;

    @Column(length = 100)
    private String customerName;

    @Column(length = 20)
    private String customerPhone;

    @Column(length = 255)
    private String customerEmail;

    // Order Items
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    // Pricing
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    // Payment Information
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentMethod paymentMethod;

    @Column(length = 100)
    private String transactionId;

    private LocalDateTime paidAt;

    // Delivery Information (for delivery orders)
    @Column(length = 500)
    private String deliveryAddress;

    @Column(length = 1000)
    private String deliveryInstructions;

    @Column(precision = 10, scale = 2)
    private BigDecimal deliveryFee;

    // Additional Information
    @Column(length = 1000)
    private String notes;

    @Column(length = 50)
    private String tableNumber;  // For dine-in orders

    private Integer estimatedPreparationTime;  // In minutes

    private LocalDateTime scheduledFor;  // For future orders

    private LocalDateTime confirmedAt;

    private LocalDateTime completedAt;

    private LocalDateTime cancelledAt;

    @Column(length = 500)
    private String cancellationReason;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Enums
    public enum OrderStatus {
        PENDING,        // Order created, awaiting confirmation
        CONFIRMED,      // Order confirmed, ready to prepare
        PREPARING,      // Being prepared
        READY,          // Ready for pickup/delivery
        OUT_FOR_DELIVERY, // Out for delivery (delivery orders only)
        COMPLETED,      // Order completed
        CANCELLED       // Order cancelled
    }

    public enum OrderType {
        DINE_IN,
        TAKEAWAY,
        DELIVERY
    }

    public enum PaymentStatus {
        PENDING,
        PAID,
        FAILED,
        REFUNDED
    }

    public enum PaymentMethod {
        CASH,
        CARD,
        MOBILE_MONEY,
        BANK_TRANSFER,
        ONLINE
    }

    // Helper methods
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    public void calculateTotals() {
        this.subtotal = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalAmount = this.subtotal
                .add(this.taxAmount)
                .subtract(this.discountAmount);

        if (this.deliveryFee != null) {
            this.totalAmount = this.totalAmount.add(this.deliveryFee);
        }
    }

    public boolean canBeCancelled() {
        return status == OrderStatus.PENDING || status == OrderStatus.CONFIRMED;
    }

    public boolean canBeUpdated() {
        return status == OrderStatus.PENDING;
    }
}
