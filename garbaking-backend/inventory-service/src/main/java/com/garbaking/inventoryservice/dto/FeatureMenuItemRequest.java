package com.garbaking.inventoryservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request payload for marking a menu item as featured.
 */
@Data
public class FeatureMenuItemRequest {

    @NotNull
    private Boolean featured;

    @Min(0)
    private Integer displayOrder;
}
