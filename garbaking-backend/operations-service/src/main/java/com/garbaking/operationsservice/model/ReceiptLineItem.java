package com.garbaking.operationsservice.model;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptLineItem {

    private String name;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
