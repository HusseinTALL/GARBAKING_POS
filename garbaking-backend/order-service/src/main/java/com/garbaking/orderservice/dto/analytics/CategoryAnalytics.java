package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;
import lombok.Singular;

import java.util.List;

@Builder
public record CategoryAnalytics(
        String categoryId,
        String categoryName,
        long quantitySold,
        double revenue,
        double profit,
        long orderCount,
        double percentageOfTotal,
        @Singular List<ProductAnalytics> topProducts,
        String trend,
        double trendPercentage
) {
}
