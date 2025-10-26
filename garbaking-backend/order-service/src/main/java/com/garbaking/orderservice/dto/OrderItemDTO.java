package com.garbaking.orderservice.dto;

import com.garbaking.orderservice.model.OrderItem;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * OrderItem Data Transfer Object
 *
 * Used for order item creation and responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private Long id;

    private Long orderId;

    @NotNull(message = "Menu item ID is required")
    private Long menuItemId;

    private String menuItemName;

    private String menuItemSku;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal unitPrice;

    private BigDecimal subtotal;

    @Size(max = 1000, message = "Special instructions cannot exceed 1000 characters")
    private String specialInstructions;

    private OrderItem.ItemStatus status;

    private LocalDateTime createdAt;
}
