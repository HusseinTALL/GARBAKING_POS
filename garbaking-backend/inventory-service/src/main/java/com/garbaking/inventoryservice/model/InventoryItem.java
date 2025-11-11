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
 * Raw materials and ingredients used in recipes
 * (e.g., Flour, Butter, Coffee Beans, Milk, etc.)
 */
@Entity
@Table(name = "inventory_items", indexes = {
        @Index(name = "idx_inv_item_sku", columnList = "sku"),
        @Index(name = "idx_inv_item_name", columnList = "name"),
        @Index(name = "idx_inv_item_category", columnList = "category_id"),
        @Index(name = "idx_inv_item_active", columnList = "isActive")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;  // Stock Keeping Unit (e.g., "ING-FLOUR-001")

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ItemCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Unit unit;  // Measurement unit

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal costPerUnit = BigDecimal.ZERO;  // Cost price per unit

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;  // Primary supplier

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal reorderPoint = BigDecimal.ZERO;  // Alert when stock falls below

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal reorderQuantity = BigDecimal.ZERO;  // How much to order

    @Column
    private Integer shelfLifeDays;  // How long item lasts before expiring

    @Column(length = 100)
    private String storageInstructions;  // e.g., "Refrigerate", "Keep frozen"

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean trackExpiry = false;  // Track expiration dates for this item

    @Column(length = 50)
    private String barcode;  // For scanning

    @Column(length = 1000)
    private String notes;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods
    public boolean isLowStock(BigDecimal currentStock) {
        return currentStock.compareTo(reorderPoint) <= 0;
    }
}
