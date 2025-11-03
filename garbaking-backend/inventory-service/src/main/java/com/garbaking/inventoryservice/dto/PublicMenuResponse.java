package com.garbaking.inventoryservice.dto;

import java.time.Instant;
import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PublicMenuResponse {
    Instant generatedAt;
    List<PublicMenuCategoryDTO> categories;
    int totalCategories;
    int totalItems;
}
