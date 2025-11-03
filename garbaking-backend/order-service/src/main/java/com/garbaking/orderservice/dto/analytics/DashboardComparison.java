package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

@Builder
public record DashboardComparison(
        double revenueChange,
        double ordersChange
) {
}
