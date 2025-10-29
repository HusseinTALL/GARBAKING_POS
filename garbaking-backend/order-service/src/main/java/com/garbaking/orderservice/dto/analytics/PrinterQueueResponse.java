package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
public record PrinterQueueResponse(
        List<Map<String, Object>> jobs,
        boolean printerOnline
) {
}
