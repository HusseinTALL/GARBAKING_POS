package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.inventory.InventoryDashboardDTO;
import com.garbaking.inventoryservice.dto.inventory.StockLevelDTO;
import com.garbaking.inventoryservice.model.InventoryLocation;
import com.garbaking.inventoryservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InventoryDashboardService {

    private final InventoryItemRepository inventoryItemRepository;
    private final StockLevelRepository stockLevelRepository;
    private final InventoryLocationRepository locationRepository;
    private final StockLevelService stockLevelService;

    public InventoryDashboardDTO getDashboard() {
        log.info("Generating inventory dashboard");

        // Get total counts
        long totalItems = inventoryItemRepository.countActiveItems();
        long lowStockItems = stockLevelRepository.countLowStockItems();
        long totalLocations = locationRepository.count();

        // Calculate total stock value across all locations
        BigDecimal totalStockValue = calculateTotalStockValue();

        // Get low stock alerts (top 10)
        List<StockLevelDTO> lowStockAlerts = stockLevelService.getLowStockItems()
                .stream()
                .limit(10)
                .collect(Collectors.toList());

        // Get recent updates (top 10)
        List<StockLevelDTO> recentUpdates = stockLevelRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getLastUpdated().compareTo(a.getLastUpdated()))
                .limit(10)
                .map(this::convertToStockLevelDTO)
                .collect(Collectors.toList());

        // Category breakdown
        List<InventoryDashboardDTO.CategoryStockSummary> categoryBreakdown = new ArrayList<>();
        // TODO: Implement category breakdown query

        return InventoryDashboardDTO.builder()
                .totalItems(totalItems)
                .lowStockItems(lowStockItems)
                .totalStockValue(totalStockValue)
                .totalLocations(totalLocations)
                .lowStockAlerts(lowStockAlerts)
                .recentUpdates(recentUpdates)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    private BigDecimal calculateTotalStockValue() {
        return stockLevelRepository.findAll()
                .stream()
                .map(sl -> sl.getQuantityOnHand().multiply(sl.getItem().getCostPerUnit()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private StockLevelDTO convertToStockLevelDTO(com.garbaking.inventoryservice.model.StockLevel stockLevel) {
        return StockLevelDTO.builder()
                .id(stockLevel.getId())
                .itemId(stockLevel.getItem().getId())
                .itemName(stockLevel.getItem().getName())
                .itemSku(stockLevel.getItem().getSku())
                .unit(stockLevel.getItem().getUnit().getDisplayName())
                .locationId(stockLevel.getLocation().getId())
                .locationName(stockLevel.getLocation().getName())
                .locationCode(stockLevel.getLocation().getLocationCode())
                .quantityOnHand(stockLevel.getQuantityOnHand())
                .quantityReserved(stockLevel.getQuantityReserved())
                .quantityOrdered(stockLevel.getQuantityOrdered())
                .quantityAvailable(stockLevel.getQuantityAvailable())
                .isLowStock(stockLevel.getIsLowStock())
                .reorderPoint(stockLevel.getItem().getReorderPoint())
                .lastUpdated(stockLevel.getLastUpdated())
                .lastCountedAt(stockLevel.getLastCountedAt())
                .build();
    }
}
