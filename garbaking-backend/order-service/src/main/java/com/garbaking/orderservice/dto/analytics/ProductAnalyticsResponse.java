package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.util.List;

@Builder
public record ProductAnalyticsResponse(
        String period,
        List<ProductAnalytics> products
) {
}
