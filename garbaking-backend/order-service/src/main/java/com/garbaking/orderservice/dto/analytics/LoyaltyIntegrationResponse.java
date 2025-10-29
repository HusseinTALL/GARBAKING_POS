package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.util.Map;

@Builder
public record LoyaltyIntegrationResponse(
        boolean enabled,
        Map<String, Object> metrics
) {
}
