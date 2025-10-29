package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record TimeAnalytics(
        int hour,
        String period,
        long orders,
        BigDecimal revenue,
        BigDecimal averageOrderValue,
        List<String> popularItems,
        int staffCount,
        double efficiency
) {
}
