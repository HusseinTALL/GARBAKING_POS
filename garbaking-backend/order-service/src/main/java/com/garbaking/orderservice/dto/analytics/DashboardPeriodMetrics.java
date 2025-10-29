package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record DashboardPeriodMetrics(
        long orders,
        BigDecimal revenue,
        BigDecimal averageOrderValue,
        DashboardComparison comparison
) {
}
