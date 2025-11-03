package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.ReceiptCreateRequest;
import com.garbaking.operationsservice.dto.ReceiptExportRequest;
import com.garbaking.operationsservice.model.ExportFormat;
import com.garbaking.operationsservice.model.Receipt;
import com.garbaking.operationsservice.model.ReceiptLineItem;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class ReceiptService {

    private final Map<Long, Receipt> receipts = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    public Receipt generateReceipt(ReceiptCreateRequest request) {
        List<ReceiptLineItem> lineItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (ReceiptCreateRequest.ReceiptLine line : request.getLineItems()) {
            BigDecimal totalPrice = line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity()));
            subtotal = subtotal.add(totalPrice);
            lineItems.add(
                ReceiptLineItem
                    .builder()
                    .name(line.getName())
                    .quantity(line.getQuantity())
                    .unitPrice(line.getUnitPrice())
                    .totalPrice(totalPrice)
                    .build()
            );
        }
        BigDecimal tax = subtotal.multiply(request.getTaxRate());
        BigDecimal total = subtotal.add(tax);
        Receipt receipt = Receipt
            .builder()
            .id(sequence.getAndIncrement())
            .orderId(request.getOrderId())
            .subtotal(subtotal)
            .tax(tax)
            .total(total)
            .generatedAt(Instant.now())
            .lineItems(lineItems)
            .build();
        receipts.put(receipt.getId(), receipt);
        return receipt;
    }

    public Receipt getReceipt(Long id) {
        Receipt receipt = receipts.get(id);
        if (receipt == null) {
            throw new IllegalArgumentException("Receipt not found");
        }
        return receipt;
    }

    public List<Receipt> listReceipts() {
        return new ArrayList<>(receipts.values());
    }

    public String exportReceipt(Long id, ReceiptExportRequest request) {
        Receipt receipt = getReceipt(id);
        String rendered = request.getFormat() == ExportFormat.CSV ? renderCsv(receipt) : renderPdfPlaceholder(receipt);
        return Base64.getEncoder().encodeToString(rendered.getBytes(StandardCharsets.UTF_8));
    }

    public Map<Long, Receipt> getReceiptStore() {
        return Collections.unmodifiableMap(receipts);
    }

    private String renderCsv(Receipt receipt) {
        StringBuilder builder = new StringBuilder();
        builder.append("Item,Qty,Unit Price,Total\n");
        for (ReceiptLineItem item : receipt.getLineItems()) {
            builder
                .append(item.getName())
                .append(',')
                .append(item.getQuantity())
                .append(',')
                .append(item.getUnitPrice())
                .append(',')
                .append(item.getTotalPrice())
                .append('\n');
        }
        builder
            .append("Subtotal,,,")
            .append(receipt.getSubtotal())
            .append('\n')
            .append("Tax,,,")
            .append(receipt.getTax())
            .append('\n')
            .append("Total,,,")
            .append(receipt.getTotal())
            .append('\n');
        return builder.toString();
    }

    private String renderPdfPlaceholder(Receipt receipt) {
        StringBuilder builder = new StringBuilder();
        builder
            .append("RECEIPT FOR ORDER ")
            .append(receipt.getOrderId())
            .append("\nGenerated: ")
            .append(receipt.getGeneratedAt())
            .append("\nTotal: ")
            .append(receipt.getTotal())
            .append("\n\nLine Items:\n");
        for (ReceiptLineItem item : receipt.getLineItems()) {
            builder
                .append(" - ")
                .append(item.getQuantity())
                .append(" x ")
                .append(item.getName())
                .append(" (")
                .append(item.getUnitPrice())
                .append(") -> ")
                .append(item.getTotalPrice())
                .append('\n');
        }
        return builder.toString();
    }
}
