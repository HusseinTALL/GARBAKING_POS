package com.garbaking.operationsservice.dto;

import com.garbaking.operationsservice.model.LoyaltyTransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class LoyaltyTransactionRequest {

    @NotNull
    private LoyaltyTransactionType type;

    @Min(1)
    private int points;

    private String description;
}
