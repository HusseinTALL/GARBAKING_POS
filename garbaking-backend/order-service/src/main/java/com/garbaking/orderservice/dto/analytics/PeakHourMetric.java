package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

@Builder
public record PeakHourMetric(
        int hour,
        long orderCount
) {
}
