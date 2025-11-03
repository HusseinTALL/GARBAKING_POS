package com.garbaking.operationsservice.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class ReceiptCreateRequest {

    @NotBlank
    private String orderId;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal taxRate;

    @Valid
    @NotEmpty
    private List<ReceiptLine> lineItems;

    @Data
    public static class ReceiptLine {

        @NotBlank
        private String name;

        @Min(1)
        private int quantity;

        @NotNull
        private BigDecimal unitPrice;
    }
}
