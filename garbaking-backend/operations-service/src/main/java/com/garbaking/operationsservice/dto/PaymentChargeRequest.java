package com.garbaking.operationsservice.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class PaymentChargeRequest {

    @NotBlank
    private String orderId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotBlank
    private String paymentMethod;

    @DecimalMin("0.00")
    private BigDecimal tipAmount = BigDecimal.ZERO;
}
