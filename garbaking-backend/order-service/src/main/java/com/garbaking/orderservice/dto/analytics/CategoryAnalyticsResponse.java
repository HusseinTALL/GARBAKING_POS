package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.util.List;

@Builder
public record CategoryAnalyticsResponse(
        String period,
        List<CategoryAnalytics> categories
) {
}
