package com.garbaking.inventoryservice.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PublicMenuItemDTO {
    Long id;
    String name;
    String description;
    String sku;
    BigDecimal price;
    String imageUrl;
    String categoryName;
    Boolean featured;
}
