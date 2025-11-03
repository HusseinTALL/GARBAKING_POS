package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.StockAdjustmentDTO;
import com.garbaking.inventoryservice.event.StockAdjustmentRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Listens for cross-service stock adjustment requests.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryStockRequestListener {

    private final MenuItemService menuItemService;

    @KafkaListener(topics = "inventory.stock.requests", groupId = "inventory-service")
    public void handleStockRequest(StockAdjustmentRequest request) {
        if (request == null || request.getMenuItemId() == null || request.getQuantity() == null) {
            log.warn("Received invalid stock adjustment request: {}", request);
            return;
        }
        try {
            StockAdjustmentDTO dto = StockAdjustmentDTO.builder()
                    .menuItemId(request.getMenuItemId())
                    .quantity(request.getQuantity())
                    .reason(request.getReason())
                    .performedBy(request.getPerformedBy())
                    .build();
            menuItemService.adjustStock(dto);
        } catch (Exception ex) {
            log.error("Failed to process stock adjustment request for item {}", request.getMenuItemId(), ex);
        }
    }
}
