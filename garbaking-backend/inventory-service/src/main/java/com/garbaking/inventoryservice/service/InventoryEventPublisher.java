package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.MenuItemDTO;
import com.garbaking.inventoryservice.event.InventoryAuditEvent;
import com.garbaking.inventoryservice.event.MenuItemLifecycleEvent;
import com.garbaking.inventoryservice.event.StockAdjustmentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Publishes inventory domain events to Kafka topics consumed by downstream services.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventPublisher {

    public static final String TOPIC_MENU_ITEM_LIFECYCLE = "inventory.menu-item.lifecycle";
    public static final String TOPIC_STOCK_ADJUSTED = "inventory.stock.adjusted";
    public static final String TOPIC_INVENTORY_AUDIT = "inventory.audit.events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishMenuItemLifecycle(String type, MenuItemDTO payload) {
        MenuItemLifecycleEvent event = MenuItemLifecycleEvent.builder()
                .type(type)
                .payload(payload)
                .occurredAt(Instant.now())
                .build();
        kafkaTemplate.send(TOPIC_MENU_ITEM_LIFECYCLE, payload.getId() != null ? payload.getId().toString() : null, event);
        log.debug("Published menu item lifecycle event {} for item {}", type, payload.getId());
    }

    public void publishStockAdjustment(StockAdjustmentEvent event) {
        kafkaTemplate.send(TOPIC_STOCK_ADJUSTED,
                event.getMenuItemId() != null ? event.getMenuItemId().toString() : null,
                event);
        log.debug("Published stock adjustment for item {}", event.getMenuItemId());
    }

    public void publishInventoryAudit(InventoryAuditEvent event) {
        kafkaTemplate.send(TOPIC_INVENTORY_AUDIT,
                event.getMenuItemId() != null ? event.getMenuItemId().toString() : null,
                event);
        log.debug("Published inventory audit event {}", event.getAuditId());
    }
}
