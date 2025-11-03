package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

@Builder
public record ComparisonData(
        SalesData current,
        SalesData previous,
        ChangeMetrics change,
        GrowthMetrics growth
) {
    @Builder
    public record ChangeMetrics(
            double sales,
            double orders,
            double aov,
            double customers
    ) {
    }

    @Builder
    public record GrowthMetrics(
            double daily,
            double weekly,
            double monthly,
            double yearly
    ) {
    }
}
