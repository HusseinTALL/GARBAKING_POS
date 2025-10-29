package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.event.InventoryAuditEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes inventory audit events produced by external systems to keep the audit log unified.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryAuditListener {

    private final InventoryAuditService inventoryAuditService;

    @KafkaListener(topics = InventoryEventPublisher.TOPIC_INVENTORY_AUDIT, groupId = "inventory-service-audit")
    public void onAuditEvent(InventoryAuditEvent event) {
        if (event == null) {
            return;
        }
        try {
            inventoryAuditService.recordExternalAudit(event);
        } catch (Exception ex) {
            log.error("Failed to ingest audit event {}", event.getAuditId(), ex);
        }
    }
}
