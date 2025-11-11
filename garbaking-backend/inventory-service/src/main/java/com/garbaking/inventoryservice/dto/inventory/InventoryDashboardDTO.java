package com.garbaking.inventoryservice.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDashboardDTO {

    private Long totalItems;
    private Long lowStockItems;
    private BigDecimal totalStockValue;
    private Long totalLocations;

    // Recent activity
    private List<StockLevelDTO> lowStockAlerts;
    private List<StockLevelDTO> recentUpdates;

    // Category breakdown
    private List<CategoryStockSummary> categoryBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStockSummary {
        private Long categoryId;
        private String categoryName;
        private Long itemCount;
        private BigDecimal totalValue;
    }
}
