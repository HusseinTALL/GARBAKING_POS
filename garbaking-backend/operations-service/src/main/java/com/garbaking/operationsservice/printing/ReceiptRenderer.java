package com.garbaking.operationsservice.printing;

import com.garbaking.operationsservice.model.Receipt;
import com.garbaking.operationsservice.model.ReceiptTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.StringTemplateResolver;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Receipt Template Renderer
 *
 * Renders receipt templates using Thymeleaf
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ReceiptRenderer {

    private static final DateTimeFormatter DATE_FORMATTER = 
        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss").withZone(ZoneId.systemDefault());

    private final TemplateEngine templateEngine;

    public ReceiptRenderer() {
        // Initialize Thymeleaf for string templates
        StringTemplateResolver resolver = new StringTemplateResolver();
        resolver.setTemplateMode(TemplateMode.TEXT);
        resolver.setCacheable(false);
        
        this.templateEngine = new TemplateEngine();
        this.templateEngine.setTemplateResolver(resolver);
    }

    /**
     * Render receipt using template
     */
    public String render(Receipt receipt, ReceiptTemplate template) {
        Context context = buildContext(receipt, template);
        
        StringBuilder result = new StringBuilder();
        
        // Render header
        if (template.getHeaderTemplate() != null) {
            try {
                String header = templateEngine.process(template.getHeaderTemplate(), context);
                result.append(header);
            } catch (Exception e) {
                log.error("Failed to render header template", e);
                result.append(getDefaultHeader(receipt));
            }
        } else {
            result.append(getDefaultHeader(receipt));
        }
        
        // Render line items
        if (template.getLineItemTemplate() != null) {
            try {
                String items = templateEngine.process(template.getLineItemTemplate(), context);
                result.append(items);
            } catch (Exception e) {
                log.error("Failed to render line item template", e);
                result.append(getDefaultLineItems(receipt));
            }
        } else {
            result.append(getDefaultLineItems(receipt));
        }
        
        // Render footer
        if (template.getFooterTemplate() != null) {
            try {
                String footer = templateEngine.process(template.getFooterTemplate(), context);
                result.append(footer);
            } catch (Exception e) {
                log.error("Failed to render footer template", e);
                result.append(getDefaultFooter(receipt));
            }
        } else {
            result.append(getDefaultFooter(receipt));
        }
        
        return result.toString();
    }

    /**
     * Build Thymeleaf context from receipt
     */
    private Context buildContext(Receipt receipt, ReceiptTemplate template) {
        Context context = new Context();
        
        // Receipt data
        context.setVariable("receipt", receipt);
        context.setVariable("storeName", receipt.getStoreName());
        context.setVariable("storeAddress", receipt.getStoreAddress());
        context.setVariable("storePhone", receipt.getStorePhone());
        context.setVariable("taxId", receipt.getTaxId());
        context.setVariable("receiptNumber", receipt.getReceiptNumber());
        context.setVariable("orderId", receipt.getOrderId());
        context.setVariable("date", DATE_FORMATTER.format(receipt.getGeneratedAt()));
        context.setVariable("serverName", receipt.getServerName());
        context.setVariable("customerName", receipt.getCustomerName());
        context.setVariable("items", receipt.getLineItems());
        context.setVariable("subtotal", receipt.getSubtotal());
        context.setVariable("tax", receipt.getTax());
        context.setVariable("discount", receipt.getDiscount());
        context.setVariable("total", receipt.getTotal());
        context.setVariable("paymentMethod", receipt.getPaymentMethod());
        context.setVariable("amountPaid", receipt.getAmountPaid());
        context.setVariable("changeGiven", receipt.getChangeGiven());
        context.setVariable("notes", receipt.getNotes());
        
        // Template settings
        context.setVariable("paperWidth", template.getPaperWidth());
        
        // Helper functions
        Map<String, Object> helpers = new HashMap<>();
        helpers.put("formatMoney", (FormatMoneyFunction) amount -> 
            amount != null ? String.format("%.2f", amount) : "0.00");
        helpers.put("repeat", (RepeatFunction) (ch, count) -> 
            String.valueOf(ch).repeat(Math.max(0, count)));
        context.setVariable("helpers", helpers);
        
        return context;
    }

    /**
     * Default header template
     */
    private String getDefaultHeader(Receipt receipt) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n");
        sb.append(center(receipt.getStoreName() != null ? receipt.getStoreName() : "GARBAKING POS", 48));
        sb.append("\n");
        if (receipt.getStoreAddress() != null) {
            sb.append(center(receipt.getStoreAddress(), 48)).append("\n");
        }
        if (receipt.getStorePhone() != null) {
            sb.append(center("Tel: " + receipt.getStorePhone(), 48)).append("\n");
        }
        sb.append("\n");
        sb.append("=".repeat(48)).append("\n");
        sb.append(String.format("Receipt #: %s\n", receipt.getReceiptNumber()));
        sb.append(String.format("Date: %s\n", DATE_FORMATTER.format(receipt.getGeneratedAt())));
        sb.append("=".repeat(48)).append("\n");
        return sb.toString();
    }

    /**
     * Default line items template
     */
    private String getDefaultLineItems(Receipt receipt) {
        StringBuilder sb = new StringBuilder();
        sb.append("\nITEMS\n");
        sb.append("-".repeat(48)).append("\n");
        
        receipt.getLineItems().forEach(item -> {
            sb.append(item.getName()).append("\n");
            sb.append(String.format("  %d x %.2f", item.getQuantity(), item.getUnitPrice()));
            sb.append(" ".repeat(48 - sb.length() % 48 - String.format("%.2f", item.getTotalPrice()).length()));
            sb.append(String.format("%.2f\n", item.getTotalPrice()));
        });
        
        sb.append("-".repeat(48)).append("\n");
        return sb.toString();
    }

    /**
     * Default footer template
     */
    private String getDefaultFooter(Receipt receipt) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("\nSubtotal:%s%.2f\n", 
            " ".repeat(48 - 9 - String.format("%.2f", receipt.getSubtotal()).length()), 
            receipt.getSubtotal()));
        sb.append(String.format("Tax:%s%.2f\n", 
            " ".repeat(48 - 4 - String.format("%.2f", receipt.getTax()).length()), 
            receipt.getTax()));
        sb.append("=".repeat(48)).append("\n");
        sb.append(String.format("TOTAL:%s%.2f\n", 
            " ".repeat(48 - 6 - String.format("%.2f", receipt.getTotal()).length()), 
            receipt.getTotal()));
        sb.append("=".repeat(48)).append("\n");
        sb.append("\n").append(center("Thank you!", 48)).append("\n\n");
        return sb.toString();
    }

    private String center(String text, int width) {
        if (text == null) return "";
        int padding = (width - text.length()) / 2;
        return " ".repeat(Math.max(0, padding)) + text;
    }

    @FunctionalInterface
    interface FormatMoneyFunction {
        String format(java.math.BigDecimal amount);
    }

    @FunctionalInterface
    interface RepeatFunction {
        String repeat(char ch, int count);
    }
}
