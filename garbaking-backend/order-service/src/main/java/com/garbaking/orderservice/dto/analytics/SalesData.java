package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record SalesData(
        BigDecimal totalSales,
        long totalOrders,
        BigDecimal averageOrderValue,
        long uniqueCustomers,
        RevenueBreakdown revenue,
        PaymentBreakdown breakdown
) {
    @Builder
    public record RevenueBreakdown(
            BigDecimal gross,
            BigDecimal net,
            BigDecimal tax,
            BigDecimal discounts,
            BigDecimal refunds
    ) {
    }

    @Builder
    public record PaymentBreakdown(
            BigDecimal cash,
            BigDecimal card,
            BigDecimal mobileMoney,
            BigDecimal credit
    ) {
    }
}
