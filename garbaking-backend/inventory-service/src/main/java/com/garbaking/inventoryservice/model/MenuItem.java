package com.garbaking.inventoryservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * MenuItem Entity
 *
 * Represents a menu item in the inventory (e.g., Croissant, Coffee).
 */
@Entity
@Table(name = "menu_items", indexes = {
        @Index(name = "idx_menu_item_category", columnList = "category_id"),
        @Index(name = "idx_menu_item_sku", columnList = "sku"),
        @Index(name = "idx_menu_item_available", columnList = "isAvailable"),
        @Index(name = "idx_menu_item_active", columnList = "isActive"),
        @Index(name = "idx_menu_item_name", columnList = "name")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(unique = true, length = 50)
    private String sku;  // Stock Keeping Unit

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal costPrice;  // Cost to make/buy

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnore
    private Category category;

    @Column(name = "category_id", insertable = false, updatable = false)
    private Long categoryId;

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MenuItemImage> images = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "menu_item_suppliers",
            joinColumns = @JoinColumn(name = "menu_item_id"),
            inverseJoinColumns = @JoinColumn(name = "supplier_id"))
    @Builder.Default
    private Set<Supplier> suppliers = new HashSet<>();

    @Column(nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column
    private Integer lowStockThreshold;  // Alert when stock falls below this

    @Column(length = 50)
    private String unit;  // e.g., "piece", "kg", "liter"

    @Column
    private Integer preparationTime;  // In minutes

    @Column
    private Integer calories;

    @Column(length = 500)
    private String allergens;  // Comma-separated list

    @Column(length = 500)
    private String ingredients;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Helper method to add image
    public void addImage(MenuItemImage image) {
        images.add(image);
        image.setMenuItem(this);
    }

    // Helper method to remove image
    public void removeImage(MenuItemImage image) {
        images.remove(image);
        image.setMenuItem(null);
    }

    public void addSupplier(Supplier supplier) {
        suppliers.add(supplier);
        supplier.getMenuItems().add(this);
    }

    public void removeSupplier(Supplier supplier) {
        suppliers.remove(supplier);
        supplier.getMenuItems().remove(this);
    }

    // Check if item is in stock
    public boolean isInStock() {
        return stockQuantity > 0;
    }

    // Check if stock is low
    public boolean isLowStock() {
        return lowStockThreshold != null && stockQuantity <= lowStockThreshold;
    }

    // Update stock quantity
    public void adjustStock(int quantity) {
        this.stockQuantity = Math.max(0, this.stockQuantity + quantity);
    }
}
