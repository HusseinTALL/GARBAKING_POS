package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;

import java.util.Map;

@Builder
public record CustomerAnalytics(
        long totalCustomers,
        long newCustomers,
        long returningCustomers,
        double averageOrdersPerCustomer,
        double customerLifetimeValue,
        double retentionRate,
        Demographics demographics
) {
    @Builder
    public record Demographics(
            Map<String, Long> ageGroups,
            Map<String, Long> genderDistribution,
            Map<String, Long> locationDistribution
    ) {
    }
}
