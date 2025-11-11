package com.garbaking.inventoryservice.controller;

import com.garbaking.inventoryservice.dto.inventory.StockAdjustmentRequest;
import com.garbaking.inventoryservice.dto.inventory.StockLevelDTO;
import com.garbaking.inventoryservice.service.StockLevelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/stock")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class StockLevelController {

    private final StockLevelService stockLevelService;

    @GetMapping
    public ResponseEntity<List<StockLevelDTO>> getAllStockLevels() {
        log.info("GET /api/inventory/stock");
        List<StockLevelDTO> stockLevels = stockLevelService.getAllStockLevels();
        return ResponseEntity.ok(stockLevels);
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<List<StockLevelDTO>> getStockLevelsByLocation(
            @PathVariable Long locationId) {
        log.info("GET /api/inventory/stock/location/{}", locationId);
        List<StockLevelDTO> stockLevels = stockLevelService.getStockLevelsByLocation(locationId);
        return ResponseEntity.ok(stockLevels);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<StockLevelDTO>> getLowStockItems() {
        log.info("GET /api/inventory/stock/low-stock");
        List<StockLevelDTO> stockLevels = stockLevelService.getLowStockItems();
        return ResponseEntity.ok(stockLevels);
    }

    @GetMapping("/item/{itemId}/location/{locationId}")
    public ResponseEntity<StockLevelDTO> getStockLevel(
            @PathVariable Long itemId,
            @PathVariable Long locationId) {
        log.info("GET /api/inventory/stock/item/{}/location/{}", itemId, locationId);
        StockLevelDTO stockLevel = stockLevelService.getStockLevel(itemId, locationId);
        return ResponseEntity.ok(stockLevel);
    }

    @PostMapping("/adjust")
    public ResponseEntity<StockLevelDTO> adjustStock(
            @Valid @RequestBody StockAdjustmentRequest request) {
        log.info("POST /api/inventory/stock/adjust - {} for item {} at location {}",
                request.getAdjustmentType(), request.getItemId(), request.getLocationId());
        StockLevelDTO stockLevel = stockLevelService.adjustStock(request);
        return ResponseEntity.ok(stockLevel);
    }
}
