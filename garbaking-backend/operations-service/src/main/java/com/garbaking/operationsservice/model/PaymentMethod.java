package com.garbaking.operationsservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethod {

    private String code;
    private String displayName;
    private PaymentMethodStatus status;
    private boolean supportsTips;
}
