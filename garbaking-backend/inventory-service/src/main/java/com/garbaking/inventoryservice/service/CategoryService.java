package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.CategoryDTO;
import com.garbaking.inventoryservice.exception.ResourceAlreadyExistsException;
import com.garbaking.inventoryservice.exception.ResourceNotFoundException;
import com.garbaking.inventoryservice.model.Category;
import com.garbaking.inventoryservice.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Category Service
 *
 * Business logic for category management.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Create a new category
     */
    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        log.info("Creating new category: {}", categoryDTO.getName());

        // Check if category already exists
        if (categoryRepository.existsByName(categoryDTO.getName())) {
            throw new ResourceAlreadyExistsException("Category with name '" + categoryDTO.getName() + "' already exists");
        }

        // Create category entity
        Category category = Category.builder()
                .name(categoryDTO.getName())
                .description(categoryDTO.getDescription())
                .imageUrl(categoryDTO.getImageUrl())
                .isActive(categoryDTO.getIsActive() != null ? categoryDTO.getIsActive() : true)
                .displayOrder(categoryDTO.getDisplayOrder() != null ? categoryDTO.getDisplayOrder() : 0)
                .color(categoryDTO.getColor())
                .build();

        // Save category
        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getId());

        // Publish category.created event
        publishCategoryEvent("category.created", savedCategory);

        return convertToDTO(savedCategory);
    }

    /**
     * Get category by ID
     */
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        log.info("Fetching category with ID: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return convertToDTO(category);
    }

    /**
     * Get all categories
     */
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        log.info("Fetching all categories");
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all active categories
     */
    @Transactional(readOnly = true)
    public List<CategoryDTO> getActiveCategories() {
        log.info("Fetching all active categories");
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get categories with menu items
     */
    @Transactional(readOnly = true)
    public List<CategoryDTO> getCategoriesWithMenuItems() {
        log.info("Fetching active categories with menu items");
        return categoryRepository.findAllActiveCategoriesWithMenuItems().stream()
                .map(this::convertToDTOWithCount)
                .collect(Collectors.toList());
    }

    /**
     * Update category
     */
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        log.info("Updating category with ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Check if new name already exists (excluding current category)
        if (categoryDTO.getName() != null && !categoryDTO.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(categoryDTO.getName())) {
                throw new ResourceAlreadyExistsException("Category with name '" + categoryDTO.getName() + "' already exists");
            }
            category.setName(categoryDTO.getName());
        }

        // Update fields
        if (categoryDTO.getDescription() != null) {
            category.setDescription(categoryDTO.getDescription());
        }
        if (categoryDTO.getImageUrl() != null) {
            category.setImageUrl(categoryDTO.getImageUrl());
        }
        if (categoryDTO.getIsActive() != null) {
            category.setIsActive(categoryDTO.getIsActive());
        }
        if (categoryDTO.getDisplayOrder() != null) {
            category.setDisplayOrder(categoryDTO.getDisplayOrder());
        }
        if (categoryDTO.getColor() != null) {
            category.setColor(categoryDTO.getColor());
        }

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated successfully: {}", updatedCategory.getId());

        // Publish category.updated event
        publishCategoryEvent("category.updated", updatedCategory);

        return convertToDTO(updatedCategory);
    }

    /**
     * Delete category
     */
    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deleting category with ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Soft delete by deactivating
        category.setIsActive(false);
        categoryRepository.save(category);

        log.info("Category deleted (deactivated) successfully: {}", id);

        // Publish category.deleted event
        publishCategoryEvent("category.deleted", category);
    }

    /**
     * Hard delete category (admin only)
     */
    @Transactional
    public void hardDeleteCategory(Long id) {
        log.info("Hard deleting category with ID: {}", id);

        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }

        categoryRepository.deleteById(id);
        log.info("Category hard deleted successfully: {}", id);
    }

    /**
     * Convert Category entity to CategoryDTO
     */
    private CategoryDTO convertToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .isActive(category.getIsActive())
                .displayOrder(category.getDisplayOrder())
                .color(category.getColor())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    /**
     * Convert Category entity to CategoryDTO with menu item count
     */
    private CategoryDTO convertToDTOWithCount(Category category) {
        CategoryDTO dto = convertToDTO(category);
        dto.setMenuItemCount((long) category.getMenuItems().size());
        return dto;
    }

    /**
     * Publish category events to Kafka
     */
    private void publishCategoryEvent(String topic, Category category) {
        try {
            CategoryDTO categoryDTO = convertToDTO(category);
            kafkaTemplate.send(topic, category.getId().toString(), categoryDTO);
            log.info("Published event to topic {}: {}", topic, category.getId());
        } catch (Exception e) {
            log.error("Failed to publish event to topic {}: {}", topic, e.getMessage());
            // Don't throw exception - event publishing shouldn't fail the main operation
        }
    }
}
