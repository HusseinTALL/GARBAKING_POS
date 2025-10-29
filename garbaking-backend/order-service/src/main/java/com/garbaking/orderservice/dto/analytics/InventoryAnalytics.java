package com.garbaking.orderservice.dto.analytics;

import lombok.Builder;
import lombok.Singular;

import java.util.List;

@Builder
public record InventoryAnalytics(
        int totalProducts,
        int lowStockItems,
        int outOfStockItems,
        List<ProductAnalytics> fastMovingItems,
        List<ProductAnalytics> slowMovingItems,
        double stockValue,
        double turnoverRate,
        @Singular("suggestion") List<ReorderSuggestion> reorderSuggestions
) {
    @Builder
    public record ReorderSuggestion(
            String productId,
            String productName,
            int currentStock,
            int suggestedOrder,
            String priority
    ) {
    }
}
