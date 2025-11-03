package com.garbaking.inventoryservice.controller;

import com.garbaking.inventoryservice.dto.ApiResponseDTO;
import com.garbaking.inventoryservice.dto.CategoryDTO;
import com.garbaking.inventoryservice.dto.PublicMenuCategoryDTO;
import com.garbaking.inventoryservice.dto.PublicMenuItemDTO;
import com.garbaking.inventoryservice.dto.PublicMenuResponse;
import com.garbaking.inventoryservice.service.CategoryService;
import com.garbaking.inventoryservice.service.MenuItemService;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public Menu Controller
 *
 * Lightweight read APIs for customer applications.
 */
@RestController
@RequestMapping("/menu")
@RequiredArgsConstructor
@Slf4j
public class PublicMenuController {

    private final CategoryService categoryService;
    private final MenuItemService menuItemService;

    @GetMapping("/public")
    public ResponseEntity<ApiResponseDTO<PublicMenuResponse>> getPublicMenu(
        @RequestParam(name = "includeEmpty", defaultValue = "false") boolean includeEmpty
    ) {
        log.debug("GET /menu/public includeEmpty={}", includeEmpty);
        List<CategoryDTO> categories = categoryService.getActiveCategories();

        List<PublicMenuCategoryDTO> payload = categories.stream()
            .sorted(Comparator.comparing(category -> Optional.ofNullable(category.getDisplayOrder()).orElse(0)))
            .map(category -> toPublicCategory(category, includeEmpty))
            .filter(category -> includeEmpty || (category.getMenuItems() != null && !category.getMenuItems().isEmpty()))
            .collect(Collectors.toList());

        int totalItems = payload.stream()
            .mapToInt(category -> category.getMenuItems() != null ? category.getMenuItems().size() : 0)
            .sum();

        PublicMenuResponse menu = PublicMenuResponse
            .builder()
            .generatedAt(Instant.now())
            .categories(payload)
            .totalCategories(payload.size())
            .totalItems(totalItems)
            .build();

        ApiResponseDTO<PublicMenuResponse> response = ApiResponseDTO
            .<PublicMenuResponse>builder()
            .success(true)
            .data(menu)
            .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponseDTO<List<PublicMenuCategoryDTO>>> getCategories(
        @RequestParam(name = "includeEmpty", defaultValue = "false") boolean includeEmpty
    ) {
        log.debug("GET /menu/categories includeEmpty={}", includeEmpty);
        List<CategoryDTO> categories = categoryService.getActiveCategories();
        List<PublicMenuCategoryDTO> result = categories.stream()
            .sorted(Comparator.comparing(category -> Optional.ofNullable(category.getDisplayOrder()).orElse(0)))
            .map(category -> toPublicCategorySkeleton(category, includeEmpty))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        ApiResponseDTO<List<PublicMenuCategoryDTO>> response = ApiResponseDTO
            .<List<PublicMenuCategoryDTO>>builder()
            .success(true)
            .data(result)
            .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponseDTO<List<PublicMenuItemDTO>>> getMenuItems(
        @RequestParam(name = "categoryId", required = false) Long categoryId,
        @RequestParam(name = "search", required = false) String search,
        @RequestParam(name = "available", defaultValue = "true") boolean availableOnly
    ) {
        log.debug("GET /menu/items categoryId={} search={} availableOnly={}", categoryId, search, availableOnly);

        List<PublicMenuItemDTO> items;
        if (StringUtils.hasText(search)) {
            items = menuItemService.searchPublicMenuItems(search.trim());
        } else if (categoryId != null) {
            items = menuItemService.getPublicMenuItemsByCategory(categoryId);
        } else if (availableOnly) {
            items = menuItemService.getPublicAvailableMenuItems();
        } else {
            items = menuItemService.getPublicAvailableMenuItems();
        }

        List<PublicMenuItemDTO> payload = items.stream()
            .sorted(Comparator
                .comparing((PublicMenuItemDTO item) -> Optional.ofNullable(item.getCategoryName()).orElse(""))
                .thenComparing(PublicMenuItemDTO::getName))
            .collect(Collectors.toList());

        ApiResponseDTO<List<PublicMenuItemDTO>> response = ApiResponseDTO
            .<List<PublicMenuItemDTO>>builder()
            .success(true)
            .data(payload)
            .build();

        return ResponseEntity.ok(response);
    }

    private PublicMenuCategoryDTO toPublicCategory(CategoryDTO category, boolean includeEmpty) {
        List<PublicMenuItemDTO> publicItems = menuItemService.getPublicMenuItemsByCategory(category.getId());

        return PublicMenuCategoryDTO
            .builder()
            .id(category.getId())
            .name(category.getName())
            .description(category.getDescription())
            .imageUrl(category.getImageUrl())
            .displayOrder(category.getDisplayOrder())
            .color(category.getColor())
            .itemCount(publicItems.size())
            .menuItems(publicItems)
            .build();
    }

    private PublicMenuCategoryDTO toPublicCategorySkeleton(CategoryDTO category, boolean includeEmpty) {
        long itemCount = menuItemService.countAvailableMenuItemsByCategory(category.getId());
        if (!includeEmpty && itemCount == 0) {
            return null;
        }
        return PublicMenuCategoryDTO
            .builder()
            .id(category.getId())
            .name(category.getName())
            .description(category.getDescription())
            .imageUrl(category.getImageUrl())
            .displayOrder(category.getDisplayOrder())
            .color(category.getColor())
            .itemCount(itemCount)
            .menuItems(List.of())
            .build();
    }
}
