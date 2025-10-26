package com.garbaking.orderservice.dto;

import com.garbaking.orderservice.model.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Create Order Data Transfer Object
 *
 * Used for creating new orders.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderDTO {

    @NotNull(message = "Order type is required")
    private Order.OrderType orderType;

    @NotNull(message = "User ID is required")
    private Long userId;

    @Size(max = 100, message = "Customer name cannot exceed 100 characters")
    private String customerName;

    @Size(max = 20, message = "Customer phone cannot exceed 20 characters")
    private String customerPhone;

    @Size(max = 255, message = "Customer email cannot exceed 255 characters")
    private String customerEmail;

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<OrderItemDTO> items;

    private BigDecimal taxAmount;

    private BigDecimal discountAmount;

    @NotNull(message = "Payment method is required")
    private Order.PaymentMethod paymentMethod;

    // For delivery orders
    @Size(max = 500, message = "Delivery address cannot exceed 500 characters")
    private String deliveryAddress;

    @Size(max = 1000, message = "Delivery instructions cannot exceed 1000 characters")
    private String deliveryInstructions;

    private BigDecimal deliveryFee;

    // Additional information
    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    @Size(max = 50, message = "Table number cannot exceed 50 characters")
    private String tableNumber;

    private LocalDateTime scheduledFor;
}
