package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.util.List;

@Builder
public record MenuPerformanceResponse(
        String period,
        List<ProductAnalytics> menuItems,
        long totalOrders
) {
}
