package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

@Builder
public record ComparisonResponse(
        ComparisonData comparison
) {
}
