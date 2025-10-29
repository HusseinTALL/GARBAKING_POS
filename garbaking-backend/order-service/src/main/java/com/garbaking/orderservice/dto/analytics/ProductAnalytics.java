package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

@Builder
public record ProductAnalytics(
        String productId,
        String productName,
        String category,
        long quantitySold,
        double revenue,
        double profit,
        double profitMargin,
        double averagePrice,
        long timesOrdered,
        double percentageOfTotal,
        String trend,
        double trendPercentage
) {
}
