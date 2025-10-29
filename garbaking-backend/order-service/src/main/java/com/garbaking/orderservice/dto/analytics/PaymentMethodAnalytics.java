package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.Map;

@Builder
public record PaymentMethodAnalytics(
        String period,
        Map<String, Long> counts,
        Map<String, BigDecimal> revenue
) {
}
