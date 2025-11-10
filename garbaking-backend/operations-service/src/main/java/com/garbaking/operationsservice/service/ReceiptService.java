package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.ReceiptCreateRequest;
import com.garbaking.operationsservice.dto.ReceiptExportRequest;
import com.garbaking.operationsservice.model.*;
import com.garbaking.operationsservice.printing.EscPosBuilder;
import com.garbaking.operationsservice.printing.ReceiptRenderer;
import com.garbaking.operationsservice.repository.ReceiptRepository;
import com.garbaking.operationsservice.repository.ReceiptTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Receipt Service
 *
 * Manages receipt generation, storage, and printing
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ReceiptTemplateRepository templateRepository;
    private final EscPosBuilder escPosBuilder;
    private final ReceiptRenderer receiptRenderer;

    private final AtomicLong receiptNumberSequence = new AtomicLong(1);

    /**
     * Generate receipt from request
     */
    @Transactional
    public Receipt generateReceipt(ReceiptCreateRequest request) {
        log.info("Generating receipt for order: {}", request.getOrderId());

        // Build receipt
        Receipt receipt = Receipt.builder()
                .orderId(request.getOrderId())
                .receiptNumber(generateReceiptNumber())
                .type(ReceiptType.CUSTOMER)
                .storeName(request.getStoreName() != null ? request.getStoreName() : "GARBAKING POS")
                .storeAddress(request.getStoreAddress())
                .storePhone(request.getStorePhone())
                .taxId(request.getTaxId())
                .subtotal(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .paymentMethod(request.getPaymentMethod())
                .serverName(request.getServerName())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .generatedAt(Instant.now())
                .build();

        // Add line items and calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        for (ReceiptCreateRequest.ReceiptLine line : request.getLineItems()) {
            BigDecimal itemTotal = line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            ReceiptLineItem lineItem = ReceiptLineItem.builder()
                    .name(line.getName())
                    .sku(line.getSku())
                    .quantity(line.getQuantity())
                    .unitPrice(line.getUnitPrice())
                    .totalPrice(itemTotal)
                    .discount(line.getDiscount() != null ? line.getDiscount() : BigDecimal.ZERO)
                    .modifiers(line.getModifiers())
                    .notes(line.getNotes())
                    .build();

            receipt.addLineItem(lineItem);
        }

        // Calculate tax and total
        BigDecimal taxRate = request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO;
        BigDecimal tax = subtotal.multiply(taxRate);
        BigDecimal total = subtotal.add(tax).subtract(receipt.getDiscount());

        receipt.setSubtotal(subtotal);
        receipt.setTax(tax);
        receipt.setTotal(total);

        if (request.getAmountPaid() != null) {
            receipt.setAmountPaid(request.getAmountPaid());
            BigDecimal change = request.getAmountPaid().subtract(total);
            if (change.compareTo(BigDecimal.ZERO) > 0) {
                receipt.setChangeGiven(change);
            }
        }

        // Generate ESC/POS commands
        try {
            byte[] escposCommands = escPosBuilder
                    .clear()
                    .buildCustomerReceipt(receipt)
                    .build();
            receipt.setEscposCommands(Base64.getEncoder().encodeToString(escposCommands));

            // Generate plain text preview
            String plainText = escPosBuilder
                    .clear()
                    .buildCustomerReceipt(receipt)
                    .buildPlainText();
            receipt.setPlainText(plainText);

        } catch (Exception e) {
            log.error("Failed to generate ESC/POS commands", e);
        }

        // Save to database
        receipt = receiptRepository.save(receipt);
        log.info("Receipt generated successfully: {}", receipt.getReceiptNumber());

        return receipt;
    }

    /**
     * Generate kitchen receipt
     */
    @Transactional
    public Receipt generateKitchenReceipt(String orderId) {
        log.info("Generating kitchen receipt for order: {}", orderId);

        // Check if customer receipt exists
        Receipt customerReceipt = receiptRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Customer receipt not found for order: " + orderId));

        // Create kitchen receipt
        Receipt kitchenReceipt = Receipt.builder()
                .orderId(orderId)
                .receiptNumber(generateReceiptNumber())
                .type(ReceiptType.KITCHEN)
                .storeName(customerReceipt.getStoreName())
                .subtotal(customerReceipt.getSubtotal())
                .tax(BigDecimal.ZERO) // Kitchen receipt doesn't show tax
                .total(customerReceipt.getSubtotal())
                .serverName(customerReceipt.getServerName())
                .generatedAt(Instant.now())
                .build();

        // Copy line items
        for (ReceiptLineItem item : customerReceipt.getLineItems()) {
            ReceiptLineItem kitchenItem = ReceiptLineItem.builder()
                    .name(item.getName())
                    .quantity(item.getQuantity())
                    .unitPrice(BigDecimal.ZERO) // No prices on kitchen receipt
                    .totalPrice(BigDecimal.ZERO)
                    .modifiers(item.getModifiers())
                    .notes(item.getNotes())
                    .build();
            kitchenReceipt.addLineItem(kitchenItem);
        }

        // Generate ESC/POS commands for kitchen printer
        try {
            byte[] escposCommands = escPosBuilder
                    .clear()
                    .buildKitchenReceipt(kitchenReceipt)
                    .build();
            kitchenReceipt.setEscposCommands(Base64.getEncoder().encodeToString(escposCommands));

            String plainText = escPosBuilder
                    .clear()
                    .buildKitchenReceipt(kitchenReceipt)
                    .buildPlainText();
            kitchenReceipt.setPlainText(plainText);

        } catch (Exception e) {
            log.error("Failed to generate kitchen receipt ESC/POS commands", e);
        }

        return receiptRepository.save(kitchenReceipt);
    }

    /**
     * Get receipt by ID
     */
    public Receipt getReceipt(Long id) {
        return receiptRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found: " + id));
    }

    /**
     * Get receipt by receipt number
     */
    public Receipt getReceiptByNumber(String receiptNumber) {
        return receiptRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found: " + receiptNumber));
    }

    /**
     * Get receipt by order ID
     */
    public Receipt getReceiptByOrderId(String orderId) {
        return receiptRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found for order: " + orderId));
    }

    /**
     * List all receipts
     */
    public List<Receipt> listReceipts() {
        return receiptRepository.findAll();
    }

    /**
     * List receipts by type
     */
    public List<Receipt> listReceiptsByType(ReceiptType type) {
        return receiptRepository.findByType(type);
    }

    /**
     * List receipts by date range
     */
    public List<Receipt> listReceiptsByDateRange(Instant start, Instant end) {
        return receiptRepository.findByGeneratedAtBetween(start, end);
    }

    /**
     * Export receipt (CSV or PDF placeholder)
     */
    public String exportReceipt(Long id, ReceiptExportRequest request) {
        Receipt receipt = getReceipt(id);
        String rendered = request.getFormat() == ExportFormat.CSV
                ? renderCsv(receipt)
                : renderPdfPlaceholder(receipt);
        return Base64.getEncoder().encodeToString(rendered.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Mark receipt as printed
     */
    @Transactional
    public void markAsPrinted(Long receiptId, Long printerId) {
        Receipt receipt = getReceipt(receiptId);
        receipt.setPrinted(true);
        receipt.setPrintedAt(Instant.now());
        receipt.setPrinterId(printerId);
        receiptRepository.save(receipt);
    }

    /**
     * Reprint receipt
     */
    public byte[] getReprintCommands(Long receiptId) {
        Receipt receipt = getReceipt(receiptId);

        if (receipt.getEscposCommands() != null) {
            // Use stored commands
            return Base64.getDecoder().decode(receipt.getEscposCommands());
        } else {
            // Regenerate commands
            return escPosBuilder
                    .clear()
                    .buildCustomerReceipt(receipt)
                    .build();
        }
    }

    // Helper methods

    private String generateReceiptNumber() {
        // Format: #00001, #00002, etc.
        // In production, this should be per-day or use database sequence
        long number = receiptNumberSequence.getAndIncrement();
        return String.format("#%05d", number);
    }

    private String renderCsv(Receipt receipt) {
        StringBuilder builder = new StringBuilder();
        builder.append("Item,Qty,Unit Price,Total\n");
        for (ReceiptLineItem item : receipt.getLineItems()) {
            builder
                    .append(item.getName()).append(',')
                    .append(item.getQuantity()).append(',')
                    .append(item.getUnitPrice()).append(',')
                    .append(item.getTotalPrice()).append('\n');
        }
        builder.append("Subtotal,,,").append(receipt.getSubtotal()).append('\n');
        builder.append("Tax,,,").append(receipt.getTax()).append('\n');
        builder.append("Total,,,").append(receipt.getTotal()).append('\n');
        return builder.toString();
    }

    private String renderPdfPlaceholder(Receipt receipt) {
        StringBuilder builder = new StringBuilder();
        builder.append("RECEIPT FOR ORDER ").append(receipt.getOrderId())
                .append("\nGenerated: ").append(receipt.getGeneratedAt())
                .append("\nTotal: ").append(receipt.getTotal())
                .append("\n\nLine Items:\n");
        for (ReceiptLineItem item : receipt.getLineItems()) {
            builder.append(" - ")
                    .append(item.getQuantity()).append(" x ")
                    .append(item.getName()).append(" (")
                    .append(item.getUnitPrice()).append(") -> ")
                    .append(item.getTotalPrice()).append('\n');
        }
        return builder.toString();
    }
}
