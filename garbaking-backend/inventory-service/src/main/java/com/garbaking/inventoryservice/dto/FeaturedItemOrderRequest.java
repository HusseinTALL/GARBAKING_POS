package com.garbaking.inventoryservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Request payload for reordering featured menu items.
 */
@Data
public class FeaturedItemOrderRequest {

    @NotEmpty
    @Valid
    private List<ItemOrder> items;

    @Data
    public static class ItemOrder {
        @NotNull
        private Long menuItemId;

        @Min(0)
        private Integer displayOrder;
    }
}
