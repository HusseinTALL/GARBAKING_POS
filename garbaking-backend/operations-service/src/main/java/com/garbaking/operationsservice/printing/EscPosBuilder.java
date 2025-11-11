package com.garbaking.operationsservice.printing;

import com.garbaking.operationsservice.model.Receipt;
import com.garbaking.operationsservice.model.ReceiptLineItem;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * ESC/POS Command Builder
 *
 * Builds ESC/POS byte commands for thermal receipt printers
 */
@Component
public class EscPosBuilder {

    private static final DateTimeFormatter DATE_FORMATTER = 
        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss").withZone(ZoneId.systemDefault());

    private final ByteArrayOutputStream buffer;
    private int paperWidth = 48; // Default 80mm thermal paper

    public EscPosBuilder() {
        this.buffer = new ByteArrayOutputStream();
    }

    /**
     * Set paper width in characters
     */
    public EscPosBuilder paperWidth(int width) {
        this.paperWidth = width;
        return this;
    }

    /**
     * Initialize printer
     */
    public EscPosBuilder initialize() {
        write(EscPosCommands.INIT);
        write(EscPosCommands.CHARSET_UTF8);
        return this;
    }

    /**
     * Add text
     */
    public EscPosBuilder text(String text) {
        if (text != null) {
            write(text.getBytes(StandardCharsets.UTF_8));
        }
        return this;
    }

    /**
     * Add text with line feed
     */
    public EscPosBuilder textLine(String text) {
        return text(text).newLine();
    }

    /**
     * Add centered text
     */
    public EscPosBuilder textCenter(String text) {
        write(EscPosCommands.ALIGN_CENTER);
        text(text);
        write(EscPosCommands.ALIGN_LEFT);
        return this;
    }

    /**
     * Add centered text with line feed
     */
    public EscPosBuilder textCenterLine(String text) {
        return textCenter(text).newLine();
    }

    /**
     * Add right-aligned text
     */
    public EscPosBuilder textRight(String text) {
        write(EscPosCommands.ALIGN_RIGHT);
        text(text);
        write(EscPosCommands.ALIGN_LEFT);
        return this;
    }

    /**
     * Add bold text
     */
    public EscPosBuilder bold(String text) {
        write(EscPosCommands.BOLD_ON);
        text(text);
        write(EscPosCommands.BOLD_OFF);
        return this;
    }

    /**
     * Add underlined text
     */
    public EscPosBuilder underline(String text) {
        write(EscPosCommands.UNDERLINE_ON);
        text(text);
        write(EscPosCommands.UNDERLINE_OFF);
        return this;
    }

    /**
     * Set text size
     */
    public EscPosBuilder textSize(int width, int height) {
        byte size = (byte) (((width - 1) << 4) | (height - 1));
        write(new byte[]{EscPosCommands.GS, '!', size});
        return this;
    }

    /**
     * Large text (double width and height)
     */
    public EscPosBuilder textLarge(String text) {
        write(EscPosCommands.TEXT_DOUBLE_BOTH);
        text(text);
        write(EscPosCommands.TEXT_NORMAL);
        return this;
    }

    /**
     * Add line separator
     */
    public EscPosBuilder separator() {
        return separator('-');
    }

    /**
     * Add line separator with custom character
     */
    public EscPosBuilder separator(char ch) {
        return textLine(repeat(ch, paperWidth));
    }

    /**
     * Add dashed separator
     */
    public EscPosBuilder dashedSeparator() {
        return textLine(repeat('=', paperWidth));
    }

    /**
     * Add new line
     */
    public EscPosBuilder newLine() {
        write(EscPosCommands.LINE_FEED);
        return this;
    }

    /**
     * Add multiple new lines
     */
    public EscPosBuilder newLines(int count) {
        for (int i = 0; i < count; i++) {
            newLine();
        }
        return this;
    }

    /**
     * Feed paper (useful before cut)
     */
    public EscPosBuilder feed(int lines) {
        write(new byte[]{EscPosCommands.ESC, 'd', (byte) lines});
        return this;
    }

    /**
     * Cut paper
     */
    public EscPosBuilder cut() {
        feed(3); // Feed before cut
        write(EscPosCommands.CUT_PARTIAL);
        return this;
    }

    /**
     * Open cash drawer
     */
    public EscPosBuilder openCashDrawer() {
        write(EscPosCommands.OPEN_DRAWER);
        return this;
    }

    /**
     * Add two-column row (left-aligned and right-aligned)
     */
    public EscPosBuilder twoColumn(String left, String right) {
        int spaces = paperWidth - left.length() - right.length();
        if (spaces < 1) spaces = 1;
        return textLine(left + repeat(' ', spaces) + right);
    }

    /**
     * Add three-column row
     */
    public EscPosBuilder threeColumn(String left, String center, String right) {
        int totalContent = left.length() + center.length() + right.length();
        int remainingSpace = paperWidth - totalContent;
        int leftSpaces = remainingSpace / 2;
        int rightSpaces = remainingSpace - leftSpaces;
        
        if (leftSpaces < 1) leftSpaces = 1;
        if (rightSpaces < 1) rightSpaces = 1;
        
        return textLine(left + repeat(' ', leftSpaces) + center + repeat(' ', rightSpaces) + right);
    }

    /**
     * Build complete customer receipt from Receipt entity
     */
    public EscPosBuilder buildCustomerReceipt(Receipt receipt) {
        initialize();
        
        // Header
        newLines(1);
        textCenterLine(receipt.getStoreName() != null ? receipt.getStoreName() : "GARBAKING POS");
        if (receipt.getStoreAddress() != null) {
            textCenterLine(receipt.getStoreAddress());
        }
        if (receipt.getStorePhone() != null) {
            textCenterLine("Tel: " + receipt.getStorePhone());
        }
        if (receipt.getTaxId() != null) {
            textCenterLine("Tax ID: " + receipt.getTaxId());
        }
        
        newLine();
        dashedSeparator();
        
        // Receipt info
        twoColumn("Receipt #:", receipt.getReceiptNumber());
        twoColumn("Date:", DATE_FORMATTER.format(receipt.getGeneratedAt()));
        if (receipt.getOrderId() != null) {
            twoColumn("Order #:", receipt.getOrderId());
        }
        if (receipt.getServerName() != null) {
            twoColumn("Server:", receipt.getServerName());
        }
        if (receipt.getCustomerName() != null) {
            twoColumn("Customer:", receipt.getCustomerName());
        }
        
        dashedSeparator();
        
        // Line items header
        newLine();
        bold("ITEMS");
        newLine();
        separator();
        
        // Line items
        for (ReceiptLineItem item : receipt.getLineItems()) {
            // Item name
            textLine(item.getName());
            
            // Quantity x Price = Total
            String qtyPrice = String.format("%d x %s", 
                item.getQuantity(), 
                formatMoney(item.getUnitPrice()));
            String total = formatMoney(item.getTotalPrice());
            twoColumn("  " + qtyPrice, total);
            
            // Modifiers if present
            if (item.getModifiers() != null && !item.getModifiers().isEmpty()) {
                textLine("  * " + item.getModifiers());
            }
        }
        
        separator();
        
        // Totals
        newLine();
        twoColumn("Subtotal:", formatMoney(receipt.getSubtotal()));
        
        if (receipt.getDiscount() != null && receipt.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            twoColumn("Discount:", "-" + formatMoney(receipt.getDiscount()));
        }
        
        twoColumn("Tax:", formatMoney(receipt.getTax()));
        
        dashedSeparator();
        write(EscPosCommands.TEXT_DOUBLE_WIDTH);
        twoColumn("TOTAL:", formatMoney(receipt.getTotal()));
        write(EscPosCommands.TEXT_NORMAL);
        dashedSeparator();
        
        // Payment info
        newLine();
        if (receipt.getPaymentMethod() != null) {
            twoColumn("Payment:", receipt.getPaymentMethod());
        }
        if (receipt.getAmountPaid() != null) {
            twoColumn("Amount Paid:", formatMoney(receipt.getAmountPaid()));
        }
        if (receipt.getChangeGiven() != null && receipt.getChangeGiven().compareTo(BigDecimal.ZERO) > 0) {
            twoColumn("Change:", formatMoney(receipt.getChangeGiven()));
        }
        
        // Footer
        newLines(2);
        textCenterLine("Thank you for your business!");
        textCenterLine("Please come again");
        
        if (receipt.getNotes() != null) {
            newLine();
            textCenterLine(receipt.getNotes());
        }
        
        newLines(2);
        
        // Cut paper
        cut();
        
        return this;
    }

    /**
     * Build kitchen receipt (no prices)
     */
    public EscPosBuilder buildKitchenReceipt(Receipt receipt) {
        initialize();
        
        // Header
        write(EscPosCommands.TEXT_DOUBLE_BOTH);
        textCenterLine("*** KITCHEN ***");
        write(EscPosCommands.TEXT_NORMAL);
        
        newLine();
        bold("Order #: " + receipt.getOrderId());
        newLine();
        textLine("Time: " + DATE_FORMATTER.format(receipt.getGeneratedAt()));
        
        if (receipt.getServerName() != null) {
            textLine("Server: " + receipt.getServerName());
        }
        
        dashedSeparator();
        
        // Items
        for (ReceiptLineItem item : receipt.getLineItems()) {
            write(EscPosCommands.TEXT_DOUBLE_HEIGHT);
            text(String.format("%dx ", item.getQuantity()));
            bold(item.getName());
            write(EscPosCommands.TEXT_NORMAL);
            newLine();
            
            if (item.getModifiers() != null && !item.getModifiers().isEmpty()) {
                textLine("  >> " + item.getModifiers().toUpperCase());
            }
            if (item.getNotes() != null && !item.getNotes().isEmpty()) {
                textLine("  NOTE: " + item.getNotes().toUpperCase());
            }
            
            newLine();
        }
        
        dashedSeparator();
        
        if (receipt.getNotes() != null) {
            newLine();
            bold("SPECIAL INSTRUCTIONS:");
            newLine();
            textLine(receipt.getNotes().toUpperCase());
        }
        
        newLines(2);
        cut();
        
        return this;
    }

    /**
     * Get built command bytes
     */
    public byte[] build() {
        return buffer.toByteArray();
    }

    /**
     * Get as Base64 string (for transmission)
     */
    public String buildBase64() {
        return java.util.Base64.getEncoder().encodeToString(build());
    }

    /**
     * Get as plain text preview
     */
    public String buildPlainText() {
        return new String(buffer.toByteArray(), StandardCharsets.UTF_8);
    }

    /**
     * Clear buffer
     */
    public EscPosBuilder clear() {
        buffer.reset();
        return this;
    }

    // Helper methods
    
    private void write(byte[] bytes) {
        try {
            buffer.write(bytes);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write to buffer", e);
        }
    }

    private void write(byte b) {
        buffer.write(b);
    }

    private String repeat(char ch, int count) {
        return String.valueOf(ch).repeat(Math.max(0, count));
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "0.00";
        return String.format("%.2f", amount);
    }
}
