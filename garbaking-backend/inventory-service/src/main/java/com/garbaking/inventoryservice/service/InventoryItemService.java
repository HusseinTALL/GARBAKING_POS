package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.inventory.CreateInventoryItemRequest;
import com.garbaking.inventoryservice.dto.inventory.InventoryItemDTO;
import com.garbaking.inventoryservice.model.InventoryItem;
import com.garbaking.inventoryservice.model.ItemCategory;
import com.garbaking.inventoryservice.model.StockLevel;
import com.garbaking.inventoryservice.model.Supplier;
import com.garbaking.inventoryservice.repository.InventoryItemRepository;
import com.garbaking.inventoryservice.repository.ItemCategoryRepository;
import com.garbaking.inventoryservice.repository.StockLevelRepository;
import com.garbaking.inventoryservice.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final ItemCategoryRepository itemCategoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockLevelRepository stockLevelRepository;

    public List<InventoryItemDTO> getAllItems() {
        return inventoryItemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryItemDTO> getActiveItems() {
        return inventoryItemRepository.findByIsActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public InventoryItemDTO getItemById(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        return convertToDTO(item);
    }

    public InventoryItemDTO getItemBySku(String sku) {
        InventoryItem item = inventoryItemRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Item not found with SKU: " + sku));
        return convertToDTO(item);
    }

    public List<InventoryItemDTO> searchItems(String search) {
        return inventoryItemRepository.searchItems(search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public InventoryItemDTO createItem(CreateInventoryItemRequest request) {
        log.info("Creating new inventory item: {}", request.getName());

        // Check if SKU already exists
        if (inventoryItemRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Item with SKU " + request.getSku() + " already exists");
        }

        // Get category
        ItemCategory category = itemCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Get supplier if provided
        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
        }

        InventoryItem item = InventoryItem.builder()
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .unit(request.getUnit())
                .costPerUnit(request.getCostPerUnit())
                .supplier(supplier)
                .reorderPoint(request.getReorderPoint())
                .reorderQuantity(request.getReorderQuantity())
                .shelfLifeDays(request.getShelfLifeDays())
                .storageInstructions(request.getStorageInstructions())
                .isActive(true)
                .trackExpiry(request.getTrackExpiry() != null ? request.getTrackExpiry() : false)
                .barcode(request.getBarcode())
                .notes(request.getNotes())
                .build();

        item = inventoryItemRepository.save(item);
        log.info("Created inventory item with ID: {}", item.getId());

        return convertToDTO(item);
    }

    public InventoryItemDTO updateItem(Long id, CreateInventoryItemRequest request) {
        log.info("Updating inventory item: {}", id);

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Check if SKU is being changed and if new SKU exists
        if (!item.getSku().equals(request.getSku()) &&
            inventoryItemRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Item with SKU " + request.getSku() + " already exists");
        }

        // Get category
        ItemCategory category = itemCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Get supplier if provided
        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
        }

        item.setSku(request.getSku());
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setCategory(category);
        item.setUnit(request.getUnit());
        item.setCostPerUnit(request.getCostPerUnit());
        item.setSupplier(supplier);
        item.setReorderPoint(request.getReorderPoint());
        item.setReorderQuantity(request.getReorderQuantity());
        item.setShelfLifeDays(request.getShelfLifeDays());
        item.setStorageInstructions(request.getStorageInstructions());
        item.setTrackExpiry(request.getTrackExpiry() != null ? request.getTrackExpiry() : false);
        item.setBarcode(request.getBarcode());
        item.setNotes(request.getNotes());

        item = inventoryItemRepository.save(item);
        log.info("Updated inventory item: {}", item.getId());

        return convertToDTO(item);
    }

    public void deleteItem(Long id) {
        log.info("Deleting inventory item: {}", id);

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Soft delete
        item.setIsActive(false);
        inventoryItemRepository.save(item);

        log.info("Deleted inventory item: {}", id);
    }

    private InventoryItemDTO convertToDTO(InventoryItem item) {
        // Calculate total stock across all locations
        List<StockLevel> stockLevels = stockLevelRepository.findByItem(item);
        BigDecimal totalOnHand = stockLevels.stream()
                .map(StockLevel::getQuantityOnHand)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAvailable = stockLevels.stream()
                .map(StockLevel::getQuantityAvailable)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        boolean isLowStock = item.isLowStock(totalOnHand);

        return InventoryItemDTO.builder()
                .id(item.getId())
                .sku(item.getSku())
                .name(item.getName())
                .description(item.getDescription())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .unit(item.getUnit())
                .unitDisplay(item.getUnit().getDisplayName())
                .costPerUnit(item.getCostPerUnit())
                .supplierId(item.getSupplier() != null ? item.getSupplier().getId() : null)
                .supplierName(item.getSupplier() != null ? item.getSupplier().getName() : null)
                .reorderPoint(item.getReorderPoint())
                .reorderQuantity(item.getReorderQuantity())
                .shelfLifeDays(item.getShelfLifeDays())
                .storageInstructions(item.getStorageInstructions())
                .isActive(item.getIsActive())
                .trackExpiry(item.getTrackExpiry())
                .barcode(item.getBarcode())
                .notes(item.getNotes())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .totalStockOnHand(totalOnHand)
                .totalStockAvailable(totalAvailable)
                .isLowStock(isLowStock)
                .build();
    }
}
