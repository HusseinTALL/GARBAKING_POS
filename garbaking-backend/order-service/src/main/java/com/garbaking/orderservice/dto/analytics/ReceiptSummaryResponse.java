package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.time.Instant;
import java.util.List;

@Builder
public record ReceiptSummaryResponse(
        long totalPrinted,
        long pendingQueue,
        List<String> recentReceipts,
        Instant lastPrintedAt
) {
}
