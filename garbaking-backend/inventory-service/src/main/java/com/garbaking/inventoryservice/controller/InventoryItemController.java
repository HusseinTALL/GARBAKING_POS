package com.garbaking.inventoryservice.controller;

import com.garbaking.inventoryservice.dto.inventory.CreateInventoryItemRequest;
import com.garbaking.inventoryservice.dto.inventory.InventoryItemDTO;
import com.garbaking.inventoryservice.service.InventoryItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/items")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    @GetMapping
    public ResponseEntity<List<InventoryItemDTO>> getAllItems(
            @RequestParam(required = false) Boolean activeOnly) {
        log.info("GET /api/inventory/items - activeOnly: {}", activeOnly);

        List<InventoryItemDTO> items = activeOnly != null && activeOnly
                ? inventoryItemService.getActiveItems()
                : inventoryItemService.getAllItems();

        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> getItemById(@PathVariable Long id) {
        log.info("GET /api/inventory/items/{}", id);
        InventoryItemDTO item = inventoryItemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<InventoryItemDTO> getItemBySku(@PathVariable String sku) {
        log.info("GET /api/inventory/items/sku/{}", sku);
        InventoryItemDTO item = inventoryItemService.getItemBySku(sku);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/search")
    public ResponseEntity<List<InventoryItemDTO>> searchItems(@RequestParam String q) {
        log.info("GET /api/inventory/items/search?q={}", q);
        List<InventoryItemDTO> items = inventoryItemService.searchItems(q);
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<InventoryItemDTO> createItem(
            @Valid @RequestBody CreateInventoryItemRequest request) {
        log.info("POST /api/inventory/items - {}", request.getName());
        InventoryItemDTO item = inventoryItemService.createItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody CreateInventoryItemRequest request) {
        log.info("PUT /api/inventory/items/{}", id);
        InventoryItemDTO item = inventoryItemService.updateItem(id, request);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        log.info("DELETE /api/inventory/items/{}", id);
        inventoryItemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
