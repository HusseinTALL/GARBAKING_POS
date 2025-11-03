package com.garbaking.orderservice.dto;

import com.garbaking.orderservice.model.Order;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Confirm Payment DTO
 *
 * Request to confirm payment via QR code.
 * Sent from cashier device after scanning QR.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmPaymentDTO {

    /**
     * Order ID to confirm payment for
     */
    @NotNull(message = "Order ID is required")
    private Long orderId;

    /**
     * Token ID that was scanned
     */
    @NotNull(message = "Token ID is required")
    private String tokenId;

    /**
     * Payment method used
     */
    @NotNull(message = "Payment method is required")
    private Order.PaymentMethod paymentMethod;

    /**
     * External transaction ID (optional)
     * For card payments or mobile money
     */
    private String transactionId;

    /**
     * Additional notes about the payment (optional)
     */
    private String notes;

    /**
     * Amount received (for validation)
     * Should match order total
     */
    private java.math.BigDecimal amountReceived;
}
