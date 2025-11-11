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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Purchase Order for ordering inventory from suppliers
 */
@Entity
@Table(name = "purchase_orders", indexes = {
        @Index(name = "idx_po_number", columnList = "orderNumber"),
        @Index(name = "idx_po_supplier", columnList = "supplier_id"),
        @Index(name = "idx_po_status", columnList = "status"),
        @Index(name = "idx_po_location", columnList = "location_id"),
        @Index(name = "idx_po_order_date", columnList = "orderDate")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String orderNumber;  // e.g., "PO-2024-001"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private InventoryLocation deliveryLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;

    @Column(nullable = false)
    private LocalDate orderDate;

    @Column
    private LocalDate expectedDeliveryDate;

    @Column
    private LocalDate actualDeliveryDate;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseOrderItem> items = new ArrayList<>();

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(length = 1000)
    private String notes;

    @Column(length = 100)
    private String createdBy;  // User who created the PO

    @Column(length = 100)
    private String approvedBy;  // User who approved the PO

    @Column
    private LocalDateTime approvedAt;

    @Column(length = 100)
    private String receivedBy;  // User who received the goods

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods
    public void addItem(PurchaseOrderItem item) {
        items.add(item);
        item.setPurchaseOrder(this);
        recalculateTotals();
    }

    public void removeItem(PurchaseOrderItem item) {
        items.remove(item);
        item.setPurchaseOrder(null);
        recalculateTotals();
    }

    public void recalculateTotals() {
        this.subtotal = items.stream()
                .map(PurchaseOrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalAmount = subtotal.add(taxAmount).add(shippingCost);
    }

    public boolean canBeEdited() {
        return status == PurchaseOrderStatus.DRAFT;
    }

    public boolean canBeReceived() {
        return status == PurchaseOrderStatus.SUBMITTED ||
               status == PurchaseOrderStatus.APPROVED ||
               status == PurchaseOrderStatus.PARTIALLY_RECEIVED;
    }

    public void markAsReceived() {
        boolean allItemsReceived = items.stream()
                .allMatch(item -> item.getQuantityReceived().compareTo(item.getQuantityOrdered()) >= 0);

        if (allItemsReceived) {
            this.status = PurchaseOrderStatus.RECEIVED;
        } else {
            boolean anyItemReceived = items.stream()
                    .anyMatch(item -> item.getQuantityReceived().compareTo(BigDecimal.ZERO) > 0);

            if (anyItemReceived) {
                this.status = PurchaseOrderStatus.PARTIALLY_RECEIVED;
            }
        }

        if (this.status == PurchaseOrderStatus.RECEIVED && this.actualDeliveryDate == null) {
            this.actualDeliveryDate = LocalDate.now();
        }
    }
}
