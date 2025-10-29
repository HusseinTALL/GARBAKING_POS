package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

@Builder
public record StaffPerformance(
        String staffId,
        String staffName,
        String role,
        double totalSales,
        long totalOrders,
        double averageOrderValue,
        double hoursWorked,
        double salesPerHour,
        Double customerRating,
        double efficiency,
        String trend
) {
}
