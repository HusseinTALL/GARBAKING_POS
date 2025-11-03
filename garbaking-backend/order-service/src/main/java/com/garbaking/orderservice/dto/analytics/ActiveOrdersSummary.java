package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

@Builder
public record ActiveOrdersSummary(
        long activeOrders,
        long pendingOrders,
        long preparingOrders,
        long readyOrders
) {
}
