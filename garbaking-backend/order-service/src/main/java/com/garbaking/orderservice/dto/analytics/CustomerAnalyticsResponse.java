package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

@Builder
public record CustomerAnalyticsResponse(
        CustomerAnalytics customers
) {
}
