package com.garbaking.inventoryservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Current stock levels for each inventory item at each location
 */
@Entity
@Table(name = "stock_levels",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_stock_item_location",
            columnNames = {"item_id", "location_id"})
    },
    indexes = {
        @Index(name = "idx_stock_item", columnList = "item_id"),
        @Index(name = "idx_stock_location", columnList = "location_id"),
        @Index(name = "idx_stock_low", columnList = "isLowStock")
    })
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InventoryItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private InventoryLocation location;

    @Column(nullable = false, precision = 15, scale = 3)
    @Builder.Default
    private BigDecimal quantityOnHand = BigDecimal.ZERO;  // Physical quantity available

    @Column(nullable = false, precision = 15, scale = 3)
    @Builder.Default
    private BigDecimal quantityReserved = BigDecimal.ZERO;  // Reserved for orders/recipes

    @Column(nullable = false, precision = 15, scale = 3)
    @Builder.Default
    private BigDecimal quantityOrdered = BigDecimal.ZERO;  // On order from suppliers

    @Column(nullable = false)
    @Builder.Default
    private Boolean isLowStock = false;  // Denormalized for quick queries

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime lastUpdated;

    @Column
    private LocalDateTime lastCountedAt;  // Last physical count

    // Computed field: Available = OnHand - Reserved
    public BigDecimal getQuantityAvailable() {
        return quantityOnHand.subtract(quantityReserved);
    }

    // Helper methods
    public void adjustQuantity(BigDecimal adjustment) {
        this.quantityOnHand = this.quantityOnHand.add(adjustment);
        if (this.quantityOnHand.compareTo(BigDecimal.ZERO) < 0) {
            this.quantityOnHand = BigDecimal.ZERO;
        }
    }

    public void reserveQuantity(BigDecimal quantity) {
        BigDecimal available = getQuantityAvailable();
        if (quantity.compareTo(available) > 0) {
            throw new IllegalStateException(
                "Cannot reserve " + quantity + " - only " + available + " available"
            );
        }
        this.quantityReserved = this.quantityReserved.add(quantity);
    }

    public void releaseReservation(BigDecimal quantity) {
        this.quantityReserved = this.quantityReserved.subtract(quantity);
        if (this.quantityReserved.compareTo(BigDecimal.ZERO) < 0) {
            this.quantityReserved = BigDecimal.ZERO;
        }
    }

    public void receiveStock(BigDecimal quantity) {
        adjustQuantity(quantity);
        // Reduce quantity ordered
        this.quantityOrdered = this.quantityOrdered.subtract(quantity);
        if (this.quantityOrdered.compareTo(BigDecimal.ZERO) < 0) {
            this.quantityOrdered = BigDecimal.ZERO;
        }
    }
}
