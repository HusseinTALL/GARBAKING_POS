package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;
import lombok.Singular;

import java.util.List;

@Builder
public record DashboardAnalytics(
        DashboardPeriodMetrics today,
        DashboardPeriodMetrics yesterday,
        ActiveOrdersSummary orders,
        @Singular List<ProductAnalytics> topMenuItems
) {
}
