package com.garbaking.inventoryservice.controller;

import com.garbaking.inventoryservice.dto.InventoryAuditDTO;
import com.garbaking.inventoryservice.dto.InventoryAuditRequest;
import com.garbaking.inventoryservice.service.InventoryAuditService;
import com.garbaking.inventoryservice.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

/**
 * Inventory audit endpoints for manual counts and historical review.
 */
@RestController
@RequestMapping("/inventory/audits")
@RequiredArgsConstructor
@Slf4j
public class InventoryAuditController {

    private final InventoryAuditService inventoryAuditService;
    private final MenuItemService menuItemService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<InventoryAuditDTO>> getAudits(
            @RequestParam(required = false) Long menuItemId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<InventoryAuditDTO> audits = inventoryAuditService.findAudits(menuItemId, from, to, page, size);
        return ResponseEntity.ok(audits);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<InventoryAuditDTO> performAudit(@Valid @RequestBody InventoryAuditRequest request) {
        log.info("POST /inventory/audits - menuItemId={}, countedQuantity={}",
                request.getMenuItemId(), request.getCountedQuantity());
        InventoryAuditDTO auditDTO = menuItemService.performInventoryAudit(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(auditDTO);
    }
}
