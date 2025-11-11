package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.inventory.StockAdjustmentRequest;
import com.garbaking.inventoryservice.dto.inventory.StockLevelDTO;
import com.garbaking.inventoryservice.model.InventoryItem;
import com.garbaking.inventoryservice.model.InventoryLocation;
import com.garbaking.inventoryservice.model.StockLevel;
import com.garbaking.inventoryservice.repository.InventoryItemRepository;
import com.garbaking.inventoryservice.repository.InventoryLocationRepository;
import com.garbaking.inventoryservice.repository.StockLevelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StockLevelService {

    private final StockLevelRepository stockLevelRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryLocationRepository locationRepository;

    public List<StockLevelDTO> getAllStockLevels() {
        return stockLevelRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StockLevelDTO> getStockLevelsByLocation(Long locationId) {
        InventoryLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        return stockLevelRepository.findByLocation(location).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StockLevelDTO> getLowStockItems() {
        return stockLevelRepository.findByIsLowStockTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StockLevelDTO getStockLevel(Long itemId, Long locationId) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        InventoryLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        StockLevel stockLevel = stockLevelRepository.findByItemAndLocation(item, location)
                .orElse(createInitialStockLevel(item, location));

        return convertToDTO(stockLevel);
    }

    public StockLevelDTO adjustStock(StockAdjustmentRequest request) {
        log.info("Adjusting stock for item {} at location {}: {} {}",
                request.getItemId(), request.getLocationId(),
                request.getQuantity(), request.getAdjustmentType());

        InventoryItem item = inventoryItemRepository.findById(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));
        InventoryLocation location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        StockLevel stockLevel = stockLevelRepository.findByItemAndLocation(item, location)
                .orElseGet(() -> createInitialStockLevel(item, location));

        // Apply adjustment based on type
        switch (request.getAdjustmentType()) {
            case "RECEIVE":
                stockLevel.receiveStock(request.getQuantity());
                break;
            case "WASTAGE":
            case "THEFT":
            case "SPOILAGE":
                stockLevel.adjustQuantity(request.getQuantity().negate());
                break;
            case "COUNT":
                // Physical count adjustment - set to exact quantity
                stockLevel.setQuantityOnHand(request.getQuantity());
                stockLevel.setLastCountedAt(LocalDateTime.now());
                break;
            default:
                throw new RuntimeException("Unknown adjustment type: " + request.getAdjustmentType());
        }

        // Update low stock flag
        stockLevel.setIsLowStock(item.isLowStock(stockLevel.getQuantityOnHand()));
        stockLevel = stockLevelRepository.save(stockLevel);

        log.info("Stock adjusted. New quantity: {}", stockLevel.getQuantityOnHand());

        // TODO: Publish stock adjustment event to Kafka

        return convertToDTO(stockLevel);
    }

    private StockLevel createInitialStockLevel(InventoryItem item, InventoryLocation location) {
        StockLevel stockLevel = StockLevel.builder()
                .item(item)
                .location(location)
                .quantityOnHand(BigDecimal.ZERO)
                .quantityReserved(BigDecimal.ZERO)
                .quantityOrdered(BigDecimal.ZERO)
                .isLowStock(true)  // Initially low since it's zero
                .build();
        return stockLevelRepository.save(stockLevel);
    }

    private StockLevelDTO convertToDTO(StockLevel stockLevel) {
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
