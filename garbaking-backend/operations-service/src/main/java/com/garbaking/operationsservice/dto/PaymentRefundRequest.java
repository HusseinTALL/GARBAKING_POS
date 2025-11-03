package com.garbaking.operationsservice.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class PaymentRefundRequest {

    @NotNull
    private Long transactionId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;
}
