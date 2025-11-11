package com.garbaking.operationsservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Receipt Line Item
 *
 * Individual item on a receipt
 */
@Entity
@Table(name = "receipt_line_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Parent receipt
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", nullable = false)
    @JsonIgnore
    private Receipt receipt;

    /**
     * Item name
     */
    @Column(nullable = false)
    private String name;

    /**
     * Item SKU/code (optional)
     */
    private String sku;

    /**
     * Quantity ordered
     */
    @Column(nullable = false)
    private Integer quantity;

    /**
     * Unit price
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    /**
     * Total price (quantity * unitPrice - discount)
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    /**
     * Discount on this line item
     */
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    /**
     * Tax on this line item
     */
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;

    /**
     * Modifiers/customizations (e.g., "No onions", "Extra cheese")
     */
    @Column(columnDefinition = "TEXT")
    private String modifiers;

    /**
     * Notes for kitchen/bar
     */
    private String notes;
}
