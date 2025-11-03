package com.garbaking.orderservice.dto;

import com.garbaking.orderservice.model.Order;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Update Payment Data Transfer Object
 *
 * Used for updating payment status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentDTO {

    @NotNull(message = "Payment status is required")
    private Order.PaymentStatus paymentStatus;

    @Size(max = 100, message = "Transaction ID cannot exceed 100 characters")
    private String transactionId;

    private Order.PaymentMethod paymentMethod;
}
