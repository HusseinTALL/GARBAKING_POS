package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.InventoryAuditDTO;
import com.garbaking.inventoryservice.event.InventoryAuditEvent;
import com.garbaking.inventoryservice.model.InventoryAudit;
import com.garbaking.inventoryservice.model.InventoryAuditSource;
import com.garbaking.inventoryservice.model.MenuItem;
import com.garbaking.inventoryservice.repository.InventoryAuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * Handles persistence and retrieval of inventory audit entries.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryAuditService {

    private final InventoryAuditRepository inventoryAuditRepository;

    @Transactional
    public InventoryAuditDTO recordStockAdjustment(MenuItem menuItem,
                                                   int changeQuantity,
                                                   int previousQuantity,
                                                   String reason,
                                                   InventoryAuditSource source,
                                                   String performedBy) {
        InventoryAudit audit = InventoryAudit.builder()
                .menuItem(menuItem)
                .menuItemName(menuItem.getName())
                .changeQuantity(changeQuantity)
                .previousQuantity(previousQuantity)
                .newQuantity(menuItem.getStockQuantity())
                .reason(reason)
                .source(source)
                .performedBy(StringUtils.hasText(performedBy) ? performedBy : "system")
                .build();
        InventoryAudit saved = inventoryAuditRepository.save(audit);
        log.debug("Recorded inventory audit {} for item {}", saved.getId(), menuItem.getId());
        return toDto(saved);
    }

    @Transactional
    public InventoryAuditDTO recordExternalAudit(InventoryAuditEvent event) {
        if (event.getSource() == InventoryAuditSource.INVENTORY_SERVICE) {
            return null;
        }
        InventoryAudit audit = InventoryAudit.builder()
                .menuItem(MenuItem.builder().id(event.getMenuItemId()).name(event.getMenuItemName()).build())
                .menuItemName(event.getMenuItemName())
                .changeQuantity(event.getChangeQuantity())
                .previousQuantity(event.getPreviousQuantity())
                .newQuantity(event.getNewQuantity())
                .reason(event.getReason())
                .source(event.getSource())
                .performedBy(event.getPerformedBy())
                .build();
        InventoryAudit saved = inventoryAuditRepository.save(audit);
        log.debug("Ingested external audit {} for item {}", saved.getId(), event.getMenuItemId());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<InventoryAuditDTO> findAudits(Long menuItemId,
                                              LocalDateTime from,
                                              LocalDateTime to,
                                              int page,
                                              int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (menuItemId != null && from != null && to != null) {
            return inventoryAuditRepository.findByMenuItemIdAndCreatedAtBetween(menuItemId, from, to, pageable)
                    .map(this::toDto);
        }
        if (menuItemId != null) {
            return inventoryAuditRepository.findByMenuItemId(menuItemId, pageable).map(this::toDto);
        }
        if (from != null && to != null) {
            return inventoryAuditRepository.findByCreatedAtBetween(from, to, pageable).map(this::toDto);
        }
        return inventoryAuditRepository.findAll(pageable).map(this::toDto);
    }

    private InventoryAuditDTO toDto(InventoryAudit audit) {
        return InventoryAuditDTO.builder()
                .id(audit.getId())
                .menuItemId(audit.getMenuItem() != null ? audit.getMenuItem().getId() : null)
                .menuItemName(audit.getMenuItemName())
                .changeQuantity(audit.getChangeQuantity())
                .previousQuantity(audit.getPreviousQuantity())
                .newQuantity(audit.getNewQuantity())
                .reason(audit.getReason())
                .source(audit.getSource())
                .performedBy(audit.getPerformedBy())
                .createdAt(audit.getCreatedAt())
                .build();
    }
}
