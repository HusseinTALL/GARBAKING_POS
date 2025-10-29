package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Builder
public record ReportConfigDto(
        String id,
        String name,
        String type,
        String schedule,
        String format,
        List<String> recipients,
        Map<String, Object> filters,
        boolean isActive,
        Instant lastGenerated,
        Instant nextScheduled
) {
}
