package com.garbaking.orderservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * OrderItem Entity
 *
 * Represents an item within an order.
 * Stores snapshot of menu item details at time of order.
 */
@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_order_item_order", columnList = "order_id"),
        @Index(name = "idx_order_item_menu_item", columnList = "menuItemId"),
        @Index(name = "idx_order_item_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @Column(name = "order_id", insertable = false, updatable = false)
    private Long orderId;

    // Menu Item Information (snapshot at time of order)
    @Column(nullable = false)
    private Long menuItemId;

    @Column(nullable = false, length = 100)
    private String menuItemName;

    @Column(length = 50)
    private String menuItemSku;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;  // Price at time of order

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;  // quantity * unitPrice

    @Column(length = 1000)
    private String specialInstructions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ItemStatus status = ItemStatus.PENDING;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Enums
    public enum ItemStatus {
        PENDING,
        PREPARING,
        READY,
        SERVED
    }

    // Helper method to calculate subtotal
    public void calculateSubtotal() {
        this.subtotal = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
    }
}
