package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
public record CustomerInsightsResponse(
        String period,
        long totalOrders,
        double averageOrderValue,
        Map<String, Long> ordersByType,
        Map<String, Long> ordersByStatus,
        List<PeakHourMetric> peakHours,
        long newCustomers,
        long returningCustomers
) {
}
