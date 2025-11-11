package com.garbaking.inventoryservice.model;

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

/**
 * Line item in a purchase order
 */
@Entity
@Table(name = "purchase_order_items", indexes = {
        @Index(name = "idx_poi_po", columnList = "purchase_order_id"),
        @Index(name = "idx_poi_item", columnList = "item_id")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InventoryItem item;

    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal quantityOrdered;

    @Column(nullable = false, precision = 15, scale = 3)
    @Builder.Default
    private BigDecimal quantityReceived = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCost;  // Cost per unit at time of ordering

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;

    @Column(length = 500)
    private String notes;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods
    public void calculateLineTotal() {
        this.lineTotal = quantityOrdered.multiply(unitCost);
    }

    public void receiveQuantity(BigDecimal quantity) {
        this.quantityReceived = this.quantityReceived.add(quantity);
    }

    public BigDecimal getRemainingQuantity() {
        return quantityOrdered.subtract(quantityReceived);
    }

    public boolean isFullyReceived() {
        return quantityReceived.compareTo(quantityOrdered) >= 0;
    }
}
