package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.util.List;

@Builder
public record PeakHoursResponse(
        String period,
        List<TimeAnalytics> peakHours
) {
}
