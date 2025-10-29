package com.garbaking.inventoryservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * MenuItemImage Data Transfer Object
 *
 * Used for menu item image creation, updates, and responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemImageDTO {

    private Long id;

    private Long menuItemId;

    @NotBlank(message = "Image URL is required")
    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    private String imageUrl;

    @Size(max = 500, message = "Thumbnail URL cannot exceed 500 characters")
    private String thumbnailUrl;

    private String signedUrl;

    @Builder.Default
    private Boolean isPrimary = false;

    @Builder.Default
    private Integer displayOrder = 0;

    @Size(max = 100, message = "Alt text cannot exceed 100 characters")
    private String altText;

    private LocalDateTime createdAt;
}
