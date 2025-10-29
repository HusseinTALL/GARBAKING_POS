package com.garbaking.operationsservice.dto;

import com.garbaking.operationsservice.model.PaymentMethodStatus;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class PaymentMethodUpdateRequest {

    @NotNull
    private PaymentMethodStatus status;

    private Boolean supportsTips;
}
