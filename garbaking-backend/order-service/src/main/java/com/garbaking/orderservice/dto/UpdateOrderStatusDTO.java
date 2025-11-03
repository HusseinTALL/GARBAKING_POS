package com.garbaking.orderservice.dto;

import com.garbaking.orderservice.model.Order;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Update Order Status Data Transfer Object
 *
 * Used for updating order status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusDTO {

    @NotNull(message = "Status is required")
    private Order.OrderStatus status;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;  // For cancellations
}
