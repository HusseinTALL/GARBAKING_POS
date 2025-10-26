package com.garbaking.inventoryservice.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MenuItem Data Transfer Object
 *
 * Used for menu item creation, updates, and responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDTO {

    private Long id;

    @NotBlank(message = "Menu item name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Size(max = 50, message = "SKU cannot exceed 50 characters")
    private String sku;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @DecimalMin(value = "0.0", message = "Cost price cannot be negative")
    private BigDecimal costPrice;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String categoryName;  // For response only

    @Builder.Default
    private List<MenuItemImageDTO> images = new ArrayList<>();

    @Builder.Default
    private Boolean isAvailable = true;

    @Builder.Default
    private Boolean isActive = true;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Builder.Default
    private Integer stockQuantity = 0;

    @Min(value = 0, message = "Low stock threshold cannot be negative")
    private Integer lowStockThreshold;

    @Size(max = 50, message = "Unit cannot exceed 50 characters")
    private String unit;

    @Min(value = 0, message = "Preparation time cannot be negative")
    private Integer preparationTime;

    @Min(value = 0, message = "Calories cannot be negative")
    private Integer calories;

    @Size(max = 500, message = "Allergens cannot exceed 500 characters")
    private String allergens;

    @Size(max = 500, message = "Ingredients cannot exceed 500 characters")
    private String ingredients;

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Integer displayOrder = 0;

    private Boolean isLowStock;  // Calculated field

    private Boolean isInStock;  // Calculated field

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
