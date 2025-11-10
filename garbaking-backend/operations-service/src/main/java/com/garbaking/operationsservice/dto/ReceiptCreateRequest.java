package com.garbaking.operationsservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ReceiptCreateRequest {

    @NotBlank
    private String orderId;

    // Store information
    private String storeName;
    private String storeAddress;
    private String storePhone;
    private String taxId;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal taxRate;

    // Payment information
    private String paymentMethod;
    private BigDecimal amountPaid;

    // Staff and customer information
    private String serverName;
    private String customerName;
    private String customerPhone;

    // Line items
    @Valid
    @NotEmpty
    private List<ReceiptLine> lineItems;

    @Data
    public static class ReceiptLine {

        @NotBlank
        private String name;

        private String sku;

        @Min(1)
        private int quantity;

        @NotNull
        @DecimalMin("0.00")
        private BigDecimal unitPrice;

        private BigDecimal discount;

        private String modifiers;

        private String notes;
    }
}
