package com.garbaking.operationsservice.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Receipt {

    private Long id;
    private String orderId;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal total;
    private Instant generatedAt;
    @Builder.Default
    private List<ReceiptLineItem> lineItems = new ArrayList<>();
}
