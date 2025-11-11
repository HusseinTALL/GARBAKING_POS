package com.garbaking.operationsservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Receipt Entity
 *
 * Represents a printed or digital receipt for an order.
 * Receipts are kept for audit and compliance purposes.
 */
@Entity
@Table(name = "receipts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Reference to the order (from order-service)
     */
    @Column(nullable = false)
    private String orderId;

    /**
     * Receipt number (e.g., #00001, displayed to customer)
     */
    @Column(nullable = false, unique = true)
    private String receiptNumber;

    /**
     * Receipt type (CUSTOMER, KITCHEN, BAR, etc.)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReceiptType type;

    /**
     * Store/location name
     */
    private String storeName;

    /**
     * Store address
     */
    private String storeAddress;

    /**
     * Store phone
     */
    private String storePhone;

    /**
     * Tax ID/VAT number
     */
    private String taxId;

    /**
     * Subtotal (before tax)
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    /**
     * Tax amount
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tax;

    /**
     * Discount amount
     */
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    /**
     * Total amount (subtotal + tax - discount)
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    /**
     * Amount paid
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal amountPaid;

    /**
     * Change given
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal changeGiven;

    /**
     * Payment method (CASH, CARD, MOBILE_MONEY, etc.)
     */
    private String paymentMethod;

    /**
     * Server/cashier name
     */
    private String serverName;

    /**
     * Customer name (optional)
     */
    private String customerName;

    /**
     * Customer phone (optional)
     */
    private String customerPhone;

    /**
     * Line items on the receipt
     */
    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ReceiptLineItem> lineItems = new ArrayList<>();

    /**
     * When the receipt was generated
     */
    @Column(nullable = false)
    private Instant generatedAt;

    /**
     * When the receipt was printed (null if not printed yet)
     */
    private Instant printedAt;

    /**
     * Printer that printed this receipt
     */
    private Long printerId;

    /**
     * Template used to generate this receipt
     */
    private Long templateId;

    /**
     * Whether this receipt was printed successfully
     */
    @Builder.Default
    private boolean printed = false;

    /**
     * ESC/POS commands (stored for reprinting)
     */
    @Column(columnDefinition = "TEXT")
    private String escposCommands;

    /**
     * Plain text version (for display/preview)
     */
    @Column(columnDefinition = "TEXT")
    private String plainText;

    /**
     * Notes or special instructions
     */
    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (generatedAt == null) {
            generatedAt = Instant.now();
        }
    }

    /**
     * Helper method to add line item
     */
    public void addLineItem(ReceiptLineItem item) {
        lineItems.add(item);
        item.setReceipt(this);
    }

    /**
     * Helper method to remove line item
     */
    public void removeLineItem(ReceiptLineItem item) {
        lineItems.remove(item);
        item.setReceipt(null);
    }
}
