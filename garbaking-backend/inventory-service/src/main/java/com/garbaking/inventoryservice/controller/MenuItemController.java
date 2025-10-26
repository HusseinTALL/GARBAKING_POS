package com.garbaking.inventoryservice.controller;

import com.garbaking.inventoryservice.dto.MenuItemDTO;
import com.garbaking.inventoryservice.dto.StockAdjustmentDTO;
import com.garbaking.inventoryservice.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * MenuItem Controller
 *
 * REST endpoints for menu item and inventory management.
 * Routes are prefixed by API Gateway: /api/menu-items
 */
@RestController
@RequestMapping("/menu-items")
@RequiredArgsConstructor
@Slf4j
public class MenuItemController {

    private final MenuItemService menuItemService;

    /**
     * Create new menu item
     * POST /menu-items
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<MenuItemDTO> createMenuItem(@Valid @RequestBody MenuItemDTO menuItemDTO) {
        log.info("POST /menu-items - Creating menu item: {}", menuItemDTO.getName());
        MenuItemDTO createdMenuItem = menuItemService.createMenuItem(menuItemDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMenuItem);
    }

    /**
     * Get menu item by ID
     * GET /menu-items/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<MenuItemDTO> getMenuItemById(@PathVariable Long id) {
        log.info("GET /menu-items/{}", id);
        MenuItemDTO menuItem = menuItemService.getMenuItemById(id);
        return ResponseEntity.ok(menuItem);
    }

    /**
     * Get menu item by SKU
     * GET /menu-items/sku/{sku}
     */
    @GetMapping("/sku/{sku}")
    public ResponseEntity<MenuItemDTO> getMenuItemBySku(@PathVariable String sku) {
        log.info("GET /menu-items/sku/{}", sku);
        MenuItemDTO menuItem = menuItemService.getMenuItemBySku(sku);
        return ResponseEntity.ok(menuItem);
    }

    /**
     * Get all menu items
     * GET /menu-items
     */
    @GetMapping
    public ResponseEntity<List<MenuItemDTO>> getAllMenuItems(
            @RequestParam(required = false) Boolean availableOnly
    ) {
        log.info("GET /menu-items - availableOnly: {}", availableOnly);

        List<MenuItemDTO> menuItems = availableOnly != null && availableOnly
                ? menuItemService.getAvailableMenuItems()
                : menuItemService.getAllMenuItems();

        return ResponseEntity.ok(menuItems);
    }

    /**
     * Get menu items by category
     * GET /menu-items/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<MenuItemDTO>> getMenuItemsByCategory(@PathVariable Long categoryId) {
        log.info("GET /menu-items/category/{}", categoryId);
        List<MenuItemDTO> menuItems = menuItemService.getMenuItemsByCategory(categoryId);
        return ResponseEntity.ok(menuItems);
    }

    /**
     * Get featured menu items
     * GET /menu-items/featured
     */
    @GetMapping("/featured")
    public ResponseEntity<List<MenuItemDTO>> getFeaturedMenuItems() {
        log.info("GET /menu-items/featured");
        List<MenuItemDTO> menuItems = menuItemService.getFeaturedMenuItems();
        return ResponseEntity.ok(menuItems);
    }

    /**
     * Get low stock items
     * GET /menu-items/low-stock
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<MenuItemDTO>> getLowStockItems() {
        log.info("GET /menu-items/low-stock");
        List<MenuItemDTO> menuItems = menuItemService.getLowStockItems();
        return ResponseEntity.ok(menuItems);
    }

    /**
     * Search menu items by name
     * GET /menu-items/search?name={name}
     */
    @GetMapping("/search")
    public ResponseEntity<List<MenuItemDTO>> searchMenuItems(@RequestParam String name) {
        log.info("GET /menu-items/search - name: {}", name);
        List<MenuItemDTO> menuItems = menuItemService.searchMenuItems(name);
        return ResponseEntity.ok(menuItems);
    }

    /**
     * Update menu item
     * PUT /menu-items/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<MenuItemDTO> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemDTO menuItemDTO
    ) {
        log.info("PUT /menu-items/{}", id);
        MenuItemDTO updatedMenuItem = menuItemService.updateMenuItem(id, menuItemDTO);
        return ResponseEntity.ok(updatedMenuItem);
    }

    /**
     * Adjust stock quantity
     * POST /menu-items/stock/adjust
     */
    @PostMapping("/stock/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<MenuItemDTO> adjustStock(@Valid @RequestBody StockAdjustmentDTO adjustmentDTO) {
        log.info("POST /menu-items/stock/adjust - Item: {}, Quantity: {}",
                adjustmentDTO.getMenuItemId(), adjustmentDTO.getQuantity());
        MenuItemDTO updatedMenuItem = menuItemService.adjustStock(adjustmentDTO);
        return ResponseEntity.ok(updatedMenuItem);
    }

    /**
     * Delete menu item (soft delete)
     * DELETE /menu-items/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        log.info("DELETE /menu-items/{}", id);
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Hard delete menu item (admin only)
     * DELETE /menu-items/{id}/hard
     */
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> hardDeleteMenuItem(@PathVariable Long id) {
        log.info("DELETE /menu-items/{}/hard", id);
        menuItemService.hardDeleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
