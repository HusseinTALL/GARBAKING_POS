package com.garbaking.inventoryservice.dto;

import java.util.List;

import lombok.Builder;
import lombok.Singular;
import lombok.Value;

@Value
@Builder
public class PublicMenuCategoryDTO {
    Long id;
    String name;
    String description;
    String imageUrl;
    Integer displayOrder;
    String color;
    long itemCount;
    @Singular
    List<PublicMenuItemDTO> menuItems;
}
