package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.FeatureMenuItemRequest;
import com.garbaking.inventoryservice.dto.FeaturedItemOrderRequest;
import com.garbaking.inventoryservice.dto.InventoryAuditDTO;
import com.garbaking.inventoryservice.dto.InventoryAuditRequest;
import com.garbaking.inventoryservice.dto.MenuItemDTO;
import com.garbaking.inventoryservice.dto.MenuItemImageDTO;
import com.garbaking.inventoryservice.dto.MenuItemImageUploadResponse;
import com.garbaking.inventoryservice.dto.PublicMenuItemDTO;
import com.garbaking.inventoryservice.dto.StockAdjustmentDTO;
import com.garbaking.inventoryservice.dto.SupplierAssignmentRequest;
import com.garbaking.inventoryservice.dto.SupplierSummaryDTO;
import com.garbaking.inventoryservice.event.InventoryAuditEvent;
import com.garbaking.inventoryservice.event.StockAdjustmentEvent;
import com.garbaking.inventoryservice.exception.InvalidStockAdjustmentException;
import com.garbaking.inventoryservice.exception.ResourceAlreadyExistsException;
import com.garbaking.inventoryservice.exception.ResourceNotFoundException;
import com.garbaking.inventoryservice.model.Category;
import com.garbaking.inventoryservice.model.InventoryAuditSource;
import com.garbaking.inventoryservice.model.MenuItem;
import com.garbaking.inventoryservice.model.MenuItemImage;
import com.garbaking.inventoryservice.model.Supplier;
import com.garbaking.inventoryservice.repository.CategoryRepository;
import com.garbaking.inventoryservice.repository.MenuItemImageRepository;
import com.garbaking.inventoryservice.repository.MenuItemRepository;
import com.garbaking.inventoryservice.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    private final SupplierRepository supplierRepository;
    private final InventoryAuditService inventoryAuditService;
    private final InventoryEventPublisher inventoryEventPublisher;
    private final ImageStorageService imageStorageService;

    // MinIO is optional - if not available, falls back to local file storage
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private MinioImageStorageService minioImageStorageService;

    @Transactional
    public MenuItemDTO createMenuItem(MenuItemDTO menuItemDTO) {
        log.info("Creating new menu item: {}", menuItemDTO.getName());

        if (menuItemDTO.getSku() != null && menuItemRepository.existsBySku(menuItemDTO.getSku())) {
            throw new ResourceAlreadyExistsException("Menu item with SKU '" + menuItemDTO.getSku() + "' already exists");
        }

        Category category = categoryRepository.findById(menuItemDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + menuItemDTO.getCategoryId()));

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

        applySuppliers(menuItem, menuItemDTO.getSupplierIds());

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        log.info("Menu item created successfully with ID: {}", savedMenuItem.getId());

        MenuItemDTO dto = convertToDTO(savedMenuItem);
        inventoryEventPublisher.publishMenuItemLifecycle("CREATED", dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public MenuItemDTO getMenuItemById(Long id) {
        MenuItem menuItem = menuItemRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
        return convertToDTOWithImages(menuItem);
    }

    @Transactional(readOnly = true)
    public MenuItemDTO getMenuItemBySku(String sku) {
        MenuItem menuItem = menuItemRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with SKU: " + sku));
        return convertToDTO(menuItem);
    }

    @Transactional(readOnly = true)
    public List<MenuItemDTO> getAllMenuItems() {
        return menuItemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemDTO> getAvailableMenuItems() {
        return menuItemRepository.findByIsActiveTrueAndIsAvailableTrueOrderByDisplayOrderAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuItemsByCategory(Long categoryId) {
        return menuItemRepository.findByCategoryIdAndIsActiveTrueAndIsAvailableTrueOrderByDisplayOrderAsc(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemDTO> getFeaturedMenuItems() {
        return menuItemRepository.findByIsFeaturedTrueAndIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemDTO> getLowStockItems() {
        return menuItemRepository.findLowStockItems().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemDTO> searchMenuItems(String name) {
        return menuItemRepository.searchByName(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PublicMenuItemDTO> getPublicMenuItemsByCategory(Long categoryId) {
        return menuItemRepository.findByCategoryIdAndIsActiveTrueAndIsAvailableTrueOrderByDisplayOrderAsc(categoryId).stream()
                .map(this::mapToPublicMenuItem)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PublicMenuItemDTO> getPublicAvailableMenuItems() {
        return menuItemRepository.findByIsActiveTrueAndIsAvailableTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToPublicMenuItem)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PublicMenuItemDTO> searchPublicMenuItems(String name) {
        return menuItemRepository.searchByName(name).stream()
                .map(this::mapToPublicMenuItem)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countAvailableMenuItemsByCategory(Long categoryId) {
        return menuItemRepository.countByCategoryIdAndIsActiveTrueAndIsAvailableTrue(categoryId);
    }

    @Transactional
    public MenuItemDTO updateMenuItem(Long id, MenuItemDTO menuItemDTO) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        if (menuItemDTO.getSku() != null && !menuItemDTO.getSku().equals(menuItem.getSku())) {
            if (menuItemRepository.existsBySku(menuItemDTO.getSku())) {
                throw new ResourceAlreadyExistsException("Menu item with SKU '" + menuItemDTO.getSku() + "' already exists");
            }
            menuItem.setSku(menuItemDTO.getSku());
        }

        if (menuItemDTO.getCategoryId() != null && !menuItemDTO.getCategoryId().equals(menuItem.getCategoryId())) {
            Category category = categoryRepository.findById(menuItemDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + menuItemDTO.getCategoryId()));
            menuItem.setCategory(category);
        }

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

        if (menuItemDTO.getSupplierIds() != null) {
            applySuppliers(menuItem, menuItemDTO.getSupplierIds());
        }

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        MenuItemDTO dto = convertToDTO(updatedMenuItem);
        inventoryEventPublisher.publishMenuItemLifecycle("UPDATED", dto);
        return dto;
    }

    @Transactional
    public MenuItemDTO assignSuppliers(Long menuItemId, SupplierAssignmentRequest request) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + menuItemId));
        applySuppliers(menuItem, request.getSupplierIds());
        MenuItem saved = menuItemRepository.save(menuItem);
        MenuItemDTO dto = convertToDTO(saved);
        inventoryEventPublisher.publishMenuItemLifecycle("SUPPLIERS_UPDATED", dto);
        return dto;
    }

    @Transactional
    public MenuItemDTO updateFeaturedStatus(Long menuItemId, FeatureMenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + menuItemId));
        menuItem.setIsFeatured(Boolean.TRUE.equals(request.getFeatured()));
        if (request.getDisplayOrder() != null) {
            menuItem.setDisplayOrder(request.getDisplayOrder());
        }
        MenuItem saved = menuItemRepository.save(menuItem);
        MenuItemDTO dto = convertToDTO(saved);
        inventoryEventPublisher.publishMenuItemLifecycle("FEATURE_UPDATED", dto);
        return dto;
    }

    @Transactional
    public List<MenuItemDTO> reorderFeaturedItems(FeaturedItemOrderRequest request) {
        for (FeaturedItemOrderRequest.ItemOrder itemOrder : request.getItems()) {
            menuItemRepository.findById(itemOrder.getMenuItemId()).ifPresent(menuItem -> {
                menuItem.setDisplayOrder(itemOrder.getDisplayOrder());
                menuItemRepository.save(menuItem);
            });
        }
        return getFeaturedMenuItems();
    }

    @Transactional
    public MenuItemImageUploadResponse uploadImage(Long menuItemId,
                                                   MultipartFile file,
                                                   Boolean primary,
                                                   Integer displayOrder,
                                                   String altText) throws IOException {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + menuItemId));

        // Try MinIO first, fall back to local storage if unavailable
        String imageUrl, thumbnailUrl, storagePath;

        if (minioImageStorageService != null) {
            try {
                log.debug("Using MinIO for image storage");
                MinioImageStorageService.ImageUploadResult uploadResult = minioImageStorageService.store(menuItemId, file);
                imageUrl = uploadResult.getCdnUrl();
                thumbnailUrl = uploadResult.getPublicUrl();
                storagePath = uploadResult.getStoragePath();
            } catch (Exception e) {
                log.warn("MinIO upload failed, falling back to local storage: {}", e.getMessage());
                ImageStorageService.ImageUploadResult fallbackResult = imageStorageService.store(menuItemId, file);
                imageUrl = fallbackResult.getCdnUrl();
                thumbnailUrl = fallbackResult.getPublicUrl();
                storagePath = fallbackResult.getStoragePath();
            }
        } else {
            log.info("MinIO not available, using local file storage");
            ImageStorageService.ImageUploadResult fallbackResult = imageStorageService.store(menuItemId, file);
            imageUrl = fallbackResult.getCdnUrl();
            thumbnailUrl = fallbackResult.getPublicUrl();
            storagePath = fallbackResult.getStoragePath();
        }

        MenuItemImage image = MenuItemImage.builder()
                .menuItem(menuItem)
                .imageUrl(imageUrl)
                .thumbnailUrl(thumbnailUrl)
                .storagePath(storagePath)
                .isPrimary(Boolean.TRUE.equals(primary))
                .displayOrder(displayOrder != null ? displayOrder : (int) (menuItemImageRepository.countByMenuItemId(menuItemId) + 1))
                .altText(altText)
                .build();

        if (Boolean.TRUE.equals(primary)) {
            menuItemImageRepository.findByMenuItemIdAndIsPrimaryTrue(menuItemId)
                    .ifPresent(existing -> {
                        existing.setIsPrimary(false);
                        menuItemImageRepository.save(existing);
                    });
        }

        MenuItemImage savedImage = menuItemImageRepository.save(image);
        MenuItemImageDTO imageDTO = convertImageToDTO(savedImage);
        String signedUrl = imageStorageService.generateSignedUrl(savedImage.getImageUrl(), null);
        return MenuItemImageUploadResponse.builder()
                .image(imageDTO)
                .signedUrl(signedUrl)
                .build();
    }

    @Transactional
    public MenuItemImageDTO updateImageMetadata(Long menuItemId,
                                                Long imageId,
                                                Boolean primary,
                                                Integer displayOrder,
                                                String altText) {
        MenuItemImage image = menuItemImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id: " + imageId));
        if (!image.getMenuItemId().equals(menuItemId)) {
            throw new ResourceNotFoundException("Image does not belong to menu item: " + menuItemId);
        }
        if (primary != null && primary) {
            menuItemImageRepository.findByMenuItemIdAndIsPrimaryTrue(menuItemId)
                    .filter(existing -> !existing.getId().equals(imageId))
                    .ifPresent(existing -> {
                        existing.setIsPrimary(false);
                        menuItemImageRepository.save(existing);
                    });
            image.setIsPrimary(true);
        } else if (primary != null) {
            image.setIsPrimary(false);
        }
        if (displayOrder != null) image.setDisplayOrder(displayOrder);
        if (altText != null) image.setAltText(altText);
        MenuItemImage saved = menuItemImageRepository.save(image);
        return convertImageToDTO(saved);
    }

    @Transactional
    public void deleteImage(Long menuItemId, Long imageId) {
        MenuItemImage image = menuItemImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id: " + imageId));
        if (!image.getMenuItemId().equals(menuItemId)) {
            throw new ResourceNotFoundException("Image does not belong to menu item: " + menuItemId);
        }
        menuItemImageRepository.delete(image);
        imageStorageService.delete(image.getStoragePath());
    }

    @Transactional(readOnly = true)
    public String generateSignedImageUrl(Long menuItemId, Long imageId, Duration duration) {
        MenuItemImage image = menuItemImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id: " + imageId));
        if (!image.getMenuItemId().equals(menuItemId)) {
            throw new ResourceNotFoundException("Image does not belong to menu item: " + menuItemId);
        }
        return imageStorageService.generateSignedUrl(image.getImageUrl(), duration);
    }

    @Transactional
    public InventoryAuditDTO performInventoryAudit(InventoryAuditRequest request) {
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + request.getMenuItemId()));
        if (request.getCountedQuantity() < 0) {
            throw new InvalidStockAdjustmentException("Counted quantity cannot be negative");
        }
        int previousQuantity = menuItem.getStockQuantity();
        int change = request.getCountedQuantity() - previousQuantity;
        menuItem.setStockQuantity(request.getCountedQuantity());
        menuItem.setIsAvailable(request.getCountedQuantity() > 0);
        MenuItem saved = menuItemRepository.save(menuItem);

        InventoryAuditDTO audit = inventoryAuditService.recordStockAdjustment(saved, change, previousQuantity,
                request.getReason(), InventoryAuditSource.MANUAL_COUNT, request.getPerformedBy());

        publishStockEvents(saved, audit, change, request.getReason(), request.getPerformedBy(), InventoryAuditSource.MANUAL_COUNT);
        return audit;
    }

    @Transactional
    public MenuItemDTO adjustStock(StockAdjustmentDTO adjustmentDTO) {
        MenuItem menuItem = menuItemRepository.findById(adjustmentDTO.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + adjustmentDTO.getMenuItemId()));

        if (adjustmentDTO.getQuantity() == 0) {
            throw new InvalidStockAdjustmentException("Quantity must be non-zero");
        }
        if (adjustmentDTO.getQuantity() < 0 && !StringUtils.hasText(adjustmentDTO.getReason())) {
            throw new InvalidStockAdjustmentException("Reason is required when reducing stock");
        }

        int previousQuantity = menuItem.getStockQuantity();
        int newQuantity = previousQuantity + adjustmentDTO.getQuantity();
        if (newQuantity < 0) {
            throw new InvalidStockAdjustmentException("Insufficient stock for requested adjustment");
        }

        menuItem.setStockQuantity(newQuantity);
        menuItem.setIsAvailable(newQuantity > 0);

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        InventoryAuditDTO audit = inventoryAuditService.recordStockAdjustment(updatedMenuItem,
                adjustmentDTO.getQuantity(), previousQuantity, adjustmentDTO.getReason(),
                InventoryAuditSource.INVENTORY_SERVICE, adjustmentDTO.getPerformedBy());

        publishStockEvents(updatedMenuItem, audit, adjustmentDTO.getQuantity(), adjustmentDTO.getReason(),
                adjustmentDTO.getPerformedBy(), InventoryAuditSource.INVENTORY_SERVICE);

        return convertToDTO(updatedMenuItem);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
        menuItem.setIsActive(false);
        menuItem.setIsAvailable(false);
        menuItemRepository.save(menuItem);
        inventoryEventPublisher.publishMenuItemLifecycle("DELETED", convertToDTO(menuItem));
    }

    @Transactional
    public void hardDeleteMenuItem(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Menu item not found with id: " + id);
        }
        menuItemRepository.deleteById(id);
        inventoryEventPublisher.publishMenuItemLifecycle("HARD_DELETED", MenuItemDTO.builder().id(id).build());
    }

    private void publishStockEvents(MenuItem menuItem,
                                    InventoryAuditDTO audit,
                                    int change,
                                    String reason,
                                    String performedBy,
                                    InventoryAuditSource source) {
        StockAdjustmentEvent stockEvent = StockAdjustmentEvent.builder()
                .auditId(audit.getId())
                .menuItemId(menuItem.getId())
                .menuItemName(menuItem.getName())
                .changeQuantity(change)
                .previousQuantity(audit.getPreviousQuantity())
                .newQuantity(audit.getNewQuantity())
                .reason(reason)
                .performedBy(performedBy)
                .source(source)
                .occurredAt(Instant.now())
                .build();
        inventoryEventPublisher.publishStockAdjustment(stockEvent);

        InventoryAuditEvent auditEvent = InventoryAuditEvent.builder()
                .auditId(audit.getId())
                .menuItemId(menuItem.getId())
                .menuItemName(menuItem.getName())
                .changeQuantity(change)
                .previousQuantity(audit.getPreviousQuantity())
                .newQuantity(audit.getNewQuantity())
                .reason(reason)
                .source(source)
                .performedBy(performedBy)
                .occurredAt(Instant.now())
                .build();
        inventoryEventPublisher.publishInventoryAudit(auditEvent);
    }

    private void applySuppliers(MenuItem menuItem, List<Long> supplierIds) {
        if (supplierIds == null) {
            return;
        }
        Set<Supplier> suppliers = supplierIds.isEmpty()
                ? Collections.emptySet()
                : new HashSet<>(supplierRepository.findAllById(supplierIds));
        menuItem.getSuppliers().forEach(supplier -> supplier.getMenuItems().remove(menuItem));
        menuItem.getSuppliers().clear();
        suppliers.forEach(menuItem::addSupplier);
    }

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
                .supplierIds(menuItem.getSuppliers().stream().map(Supplier::getId).collect(Collectors.toList()))
                .suppliers(menuItem.getSuppliers().stream().map(this::convertSupplierToSummary).collect(Collectors.toList()))
                .createdAt(menuItem.getCreatedAt())
                .updatedAt(menuItem.getUpdatedAt())
                .build();
    }

    private MenuItemDTO convertToDTOWithImages(MenuItem menuItem) {
        MenuItemDTO dto = convertToDTO(menuItem);
        dto.setImages(menuItem.getImages().stream()
                .map(this::convertImageToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private MenuItemImageDTO convertImageToDTO(MenuItemImage image) {
        String signedUrl = imageStorageService.generateSignedUrl(image.getImageUrl(), null);
        return MenuItemImageDTO.builder()
                .id(image.getId())
                .menuItemId(image.getMenuItemId())
                .imageUrl(image.getImageUrl())
                .thumbnailUrl(image.getThumbnailUrl())
                .signedUrl(signedUrl)
                .isPrimary(image.getIsPrimary())
                .displayOrder(image.getDisplayOrder())
                .altText(image.getAltText())
                .createdAt(image.getCreatedAt())
                .build();
    }

    private SupplierSummaryDTO convertSupplierToSummary(Supplier supplier) {
        return SupplierSummaryDTO.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .preferred(supplier.getPreferred())
                .leadTimeDays(supplier.getLeadTimeDays())
                .build();
    }

    private PublicMenuItemDTO mapToPublicMenuItem(MenuItem menuItem) {
        return PublicMenuItemDTO.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .sku(menuItem.getSku())
                .price(menuItem.getPrice())
                .categoryName(menuItem.getCategory() != null ? menuItem.getCategory().getName() : null)
                .imageUrl(resolvePrimaryImage(menuItem))
                .featured(menuItem.getIsFeatured())
                .build();
    }

    private String resolvePrimaryImage(MenuItem menuItem) {
        if (menuItem.getImages() == null || menuItem.getImages().isEmpty()) {
            return null;
        }

        return menuItem.getImages().stream()
                .sorted(Comparator
                        .comparing(MenuItemImage::getIsPrimary, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(image -> image.getDisplayOrder() != null ? image.getDisplayOrder() : 0))
                .map(image -> {
                    String signed = imageStorageService.generateSignedUrl(image.getImageUrl(), null);
                    if (StringUtils.hasText(signed)) {
                        return signed;
                    }
                    if (StringUtils.hasText(image.getThumbnailUrl())) {
                        return image.getThumbnailUrl();
                    }
                    return image.getImageUrl();
                })
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse(null);
    }
}
