package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.time.Instant;

@Builder
public record GeneratedReportResponse(
        String reportUrl,
        String type,
        Instant generatedAt
) {
}
