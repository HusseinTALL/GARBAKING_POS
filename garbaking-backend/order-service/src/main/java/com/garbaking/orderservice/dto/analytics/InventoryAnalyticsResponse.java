package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

@Builder
public record InventoryAnalyticsResponse(
        InventoryAnalytics inventory
) {
}
