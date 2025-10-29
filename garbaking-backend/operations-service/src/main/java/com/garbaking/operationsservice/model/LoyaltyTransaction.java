package com.garbaking.operationsservice.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTransaction {

    private Long id;
    private Long memberId;
    private LoyaltyTransactionType type;
    private int points;
    private String description;
    private Instant occurredAt;
}
