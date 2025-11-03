package com.garbaking.inventoryservice.controller;

import com.garbaking.inventoryservice.dto.CategoryDTO;
import com.garbaking.inventoryservice.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Category Controller
 *
 * REST endpoints for category management.
 * Routes are prefixed by API Gateway: /api/categories
 */
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Create new category
     * POST /categories
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        log.info("POST /categories - Creating category: {}", categoryDTO.getName());
        CategoryDTO createdCategory = categoryService.createCategory(categoryDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    /**
     * Get category by ID
     * GET /categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        log.info("GET /categories/{}", id);
        CategoryDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    /**
     * Get all categories
     * GET /categories
     */
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories(
            @RequestParam(required = false) Boolean activeOnly
    ) {
        log.info("GET /categories - activeOnly: {}", activeOnly);

        List<CategoryDTO> categories = activeOnly != null && activeOnly
                ? categoryService.getActiveCategories()
                : categoryService.getAllCategories();

        return ResponseEntity.ok(categories);
    }

    /**
     * Get categories with menu item counts
     * GET /categories/with-counts
     */
    @GetMapping("/with-counts")
    public ResponseEntity<List<CategoryDTO>> getCategoriesWithMenuItems() {
        log.info("GET /categories/with-counts");
        List<CategoryDTO> categories = categoryService.getCategoriesWithMenuItems();
        return ResponseEntity.ok(categories);
    }

    /**
     * Update category
     * PUT /categories/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO categoryDTO
    ) {
        log.info("PUT /categories/{}", id);
        CategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDTO);
        return ResponseEntity.ok(updatedCategory);
    }

    /**
     * Delete category (soft delete)
     * DELETE /categories/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        log.info("DELETE /categories/{}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Hard delete category (admin only)
     * DELETE /categories/{id}/hard
     */
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> hardDeleteCategory(@PathVariable Long id) {
        log.info("DELETE /categories/{}/hard", id);
        categoryService.hardDeleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
