package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.MenuItemDTO;
import com.garbaking.inventoryservice.dto.MenuItemImageDTO;
import com.garbaking.inventoryservice.dto.StockAdjustmentDTO;
import com.garbaking.inventoryservice.exception.ResourceAlreadyExistsException;
import com.garbaking.inventoryservice.exception.ResourceNotFoundException;
import com.garbaking.inventoryservice.model.Category;
import com.garbaking.inventoryservice.model.MenuItem;
import com.garbaking.inventoryservice.model.MenuItemImage;
import com.garbaking.inventoryservice.repository.CategoryRepository;
import com.garbaking.inventoryservice.repository.MenuItemImageRepository;
import com.garbaking.inventoryservice.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * MenuItem Service
 *
 * Business logic for menu item and inventory management.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemImageRepository menuItemImageRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Create a new menu item
     */
    @Transactional
    public MenuItemDTO createMenuItem(MenuItemDTO menuItemDTO) {
        log.info("Creating new menu item: {}", menuItemDTO.getName());

        // Check if SKU already exists
        if (menuItemDTO.getSku() != null && menuItemRepository.existsBySku(menuItemDTO.getSku())) {
            throw new ResourceAlreadyExistsException("Menu item with SKU '" + menuItemDTO.getSku() + "' already exists");
        }

        // Verify category exists
        Category category = categoryRepository.findById(menuItemDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + menuItemDTO.getCategoryId()));

        // Create menu item entity
        MenuItem menuItem = MenuItem.builder()
                .name(menuItemDTO.getName())
                .description(menuItemDTO.getDescription())
                .sku(menuItemDTO.getSku())
                .price(menuItemDTO.getPrice())
                .costPrice(menuItemDTO.getCostPrice())
                .category(category)
                .isAvailable(menuItemDTO.getIsAvailable() != null ? menuItemDTO.getIsAvailable() : true)
                .isActive(menuItemDTO.getIsActive() != null ? menuItemDTO.getIsActive() : true)
                .stockQuantity(menuItemDTO.getStockQuantity() != null ? menuItemDTO.getStockQuantity() : 0)
                .lowStockThreshold(menuItemDTO.getLowStockThreshold())
                .unit(menuItemDTO.getUnit())
                .preparationTime(menuItemDTO.getPreparationTime())
                .calories(menuItemDTO.getCalories())
                .allergens(menuItemDTO.getAllergens())
                .ingredients(menuItemDTO.getIngredients())
                .isFeatured(menuItemDTO.getIsFeatured() != null ? menuItemDTO.getIsFeatured() : false)
                .displayOrder(menuItemDTO.getDisplayOrder() != null ? menuItemDTO.getDisplayOrder() : 0)
                .build();

        // Save menu item
        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        log.info("Menu item created successfully with ID: {}", savedMenuItem.getId());

        // Publish menuitem.created event
        publishMenuItemEvent("menuitem.created", savedMenuItem);

        return convertToDTO(savedMenuItem);
    }

    /**
     * Get menu item by ID
     */
    @Transactional(readOnly = true)
    public MenuItemDTO getMenuItemById(Long id) {
        log.info("Fetching menu item with ID: {}", id);
        MenuItem menuItem = menuItemRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
        return convertToDTOWithImages(menuItem);
    }

    /**
     * Get menu item by SKU
     */
    @Transactional(readOnly = true)
    public MenuItemDTO getMenuItemBySku(String sku) {
        log.info("Fetching menu item with SKU: {}", sku);
        MenuItem menuItem = menuItemRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with SKU: " + sku));
        return convertToDTO(menuItem);
    }

    /**
     * Get all menu items
     */
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getAllMenuItems() {
        log.info("Fetching all menu items");
        return menuItemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get active and available menu items
     */
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getAvailableMenuItems() {
        log.info("Fetching available menu items");
        return menuItemRepository.findByIsActiveTrueAndIsAvailableTrueOrderByDisplayOrderAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get menu items by category
     */
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuItemsByCategory(Long categoryId) {
        log.info("Fetching menu items for category: {}", categoryId);
        return menuItemRepository.findByCategoryIdAndIsActiveTrueAndIsAvailableTrueOrderByDisplayOrderAsc(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get featured menu items
     */
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getFeaturedMenuItems() {
        log.info("Fetching featured menu items");
        return menuItemRepository.findByIsFeaturedTrueAndIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get low stock items
     */
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getLowStockItems() {
        log.info("Fetching low stock items");
        return menuItemRepository.findLowStockItems().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search menu items by name
     */
    @Transactional(readOnly = true)
    public List<MenuItemDTO> searchMenuItems(String name) {
        log.info("Searching menu items with name: {}", name);
        return menuItemRepository.searchByName(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update menu item
     */
    @Transactional
    public MenuItemDTO updateMenuItem(Long id, MenuItemDTO menuItemDTO) {
        log.info("Updating menu item with ID: {}", id);

        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        // Check if new SKU already exists (excluding current item)
        if (menuItemDTO.getSku() != null && !menuItemDTO.getSku().equals(menuItem.getSku())) {
            if (menuItemRepository.existsBySku(menuItemDTO.getSku())) {
                throw new ResourceAlreadyExistsException("Menu item with SKU '" + menuItemDTO.getSku() + "' already exists");
            }
            menuItem.setSku(menuItemDTO.getSku());
        }

        // Update category if changed
        if (menuItemDTO.getCategoryId() != null && !menuItemDTO.getCategoryId().equals(menuItem.getCategoryId())) {
            Category category = categoryRepository.findById(menuItemDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + menuItemDTO.getCategoryId()));
            menuItem.setCategory(category);
        }

        // Update fields
        if (menuItemDTO.getName() != null) menuItem.setName(menuItemDTO.getName());
        if (menuItemDTO.getDescription() != null) menuItem.setDescription(menuItemDTO.getDescription());
        if (menuItemDTO.getPrice() != null) menuItem.setPrice(menuItemDTO.getPrice());
        if (menuItemDTO.getCostPrice() != null) menuItem.setCostPrice(menuItemDTO.getCostPrice());
        if (menuItemDTO.getIsAvailable() != null) menuItem.setIsAvailable(menuItemDTO.getIsAvailable());
        if (menuItemDTO.getIsActive() != null) menuItem.setIsActive(menuItemDTO.getIsActive());
        if (menuItemDTO.getLowStockThreshold() != null) menuItem.setLowStockThreshold(menuItemDTO.getLowStockThreshold());
        if (menuItemDTO.getUnit() != null) menuItem.setUnit(menuItemDTO.getUnit());
        if (menuItemDTO.getPreparationTime() != null) menuItem.setPreparationTime(menuItemDTO.getPreparationTime());
        if (menuItemDTO.getCalories() != null) menuItem.setCalories(menuItemDTO.getCalories());
        if (menuItemDTO.getAllergens() != null) menuItem.setAllergens(menuItemDTO.getAllergens());
        if (menuItemDTO.getIngredients() != null) menuItem.setIngredients(menuItemDTO.getIngredients());
        if (menuItemDTO.getIsFeatured() != null) menuItem.setIsFeatured(menuItemDTO.getIsFeatured());
        if (menuItemDTO.getDisplayOrder() != null) menuItem.setDisplayOrder(menuItemDTO.getDisplayOrder());

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        log.info("Menu item updated successfully: {}", updatedMenuItem.getId());

        // Publish menuitem.updated event
        publishMenuItemEvent("menuitem.updated", updatedMenuItem);

        return convertToDTO(updatedMenuItem);
    }

    /**
     * Adjust stock quantity
     */
    @Transactional
    public MenuItemDTO adjustStock(StockAdjustmentDTO adjustmentDTO) {
        log.info("Adjusting stock for menu item: {} by {}", adjustmentDTO.getMenuItemId(), adjustmentDTO.getQuantity());

        MenuItem menuItem = menuItemRepository.findById(adjustmentDTO.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + adjustmentDTO.getMenuItemId()));

        // Adjust stock
        menuItem.adjustStock(adjustmentDTO.getQuantity());

        // Update availability based on stock
        if (menuItem.getStockQuantity() == 0) {
            menuItem.setIsAvailable(false);
        }

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        log.info("Stock adjusted successfully. New quantity: {}", updatedMenuItem.getStockQuantity());

        // Publish stock.adjusted event
        publishStockAdjustmentEvent(updatedMenuItem, adjustmentDTO);

        return convertToDTO(updatedMenuItem);
    }

    /**
     * Delete menu item (soft delete)
     */
    @Transactional
    public void deleteMenuItem(Long id) {
        log.info("Deleting menu item with ID: {}", id);

        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        // Soft delete by deactivating
        menuItem.setIsActive(false);
        menuItem.setIsAvailable(false);
        menuItemRepository.save(menuItem);

        log.info("Menu item deleted (deactivated) successfully: {}", id);

        // Publish menuitem.deleted event
        publishMenuItemEvent("menuitem.deleted", menuItem);
    }

    /**
     * Hard delete menu item (admin only)
     */
    @Transactional
    public void hardDeleteMenuItem(Long id) {
        log.info("Hard deleting menu item with ID: {}", id);

        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Menu item not found with id: " + id);
        }

        menuItemRepository.deleteById(id);
        log.info("Menu item hard deleted successfully: {}", id);
    }

    /**
     * Convert MenuItem entity to MenuItemDTO
     */
    private MenuItemDTO convertToDTO(MenuItem menuItem) {
        return MenuItemDTO.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .sku(menuItem.getSku())
                .price(menuItem.getPrice())
                .costPrice(menuItem.getCostPrice())
                .categoryId(menuItem.getCategoryId())
                .categoryName(menuItem.getCategory() != null ? menuItem.getCategory().getName() : null)
                .isAvailable(menuItem.getIsAvailable())
                .isActive(menuItem.getIsActive())
                .stockQuantity(menuItem.getStockQuantity())
                .lowStockThreshold(menuItem.getLowStockThreshold())
                .unit(menuItem.getUnit())
                .preparationTime(menuItem.getPreparationTime())
                .calories(menuItem.getCalories())
                .allergens(menuItem.getAllergens())
                .ingredients(menuItem.getIngredients())
                .isFeatured(menuItem.getIsFeatured())
                .displayOrder(menuItem.getDisplayOrder())
                .isLowStock(menuItem.isLowStock())
                .isInStock(menuItem.isInStock())
                .createdAt(menuItem.getCreatedAt())
                .updatedAt(menuItem.getUpdatedAt())
                .build();
    }

    /**
     * Convert MenuItem entity to MenuItemDTO with images
     */
    private MenuItemDTO convertToDTOWithImages(MenuItem menuItem) {
        MenuItemDTO dto = convertToDTO(menuItem);
        dto.setImages(menuItem.getImages().stream()
                .map(this::convertImageToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    /**
     * Convert MenuItemImage entity to MenuItemImageDTO
     */
    private MenuItemImageDTO convertImageToDTO(MenuItemImage image) {
        return MenuItemImageDTO.builder()
                .id(image.getId())
                .menuItemId(image.getMenuItemId())
                .imageUrl(image.getImageUrl())
                .thumbnailUrl(image.getThumbnailUrl())
                .isPrimary(image.getIsPrimary())
                .displayOrder(image.getDisplayOrder())
                .altText(image.getAltText())
                .createdAt(image.getCreatedAt())
                .build();
    }

    /**
     * Publish menu item events to Kafka
     */
    private void publishMenuItemEvent(String topic, MenuItem menuItem) {
        try {
            MenuItemDTO menuItemDTO = convertToDTO(menuItem);
            kafkaTemplate.send(topic, menuItem.getId().toString(), menuItemDTO);
            log.info("Published event to topic {}: {}", topic, menuItem.getId());
        } catch (Exception e) {
            log.error("Failed to publish event to topic {}: {}", topic, e.getMessage());
            // Don't throw exception - event publishing shouldn't fail the main operation
        }
    }

    /**
     * Publish stock adjustment events to Kafka
     */
    private void publishStockAdjustmentEvent(MenuItem menuItem, StockAdjustmentDTO adjustmentDTO) {
        try {
            kafkaTemplate.send("stock.adjusted", menuItem.getId().toString(), adjustmentDTO);
            log.info("Published stock adjustment event for menu item: {}", menuItem.getId());
        } catch (Exception e) {
            log.error("Failed to publish stock adjustment event: {}", e.getMessage());
        }
    }
}
