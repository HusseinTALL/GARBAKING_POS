package com.garbaking.analyticsservice.dto;

import java.time.Instant;
import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BudgetSuggestionResponse {
    boolean success;
    @Builder.Default
    Instant generatedAt = Instant.now();
    List<BudgetSuggestionBundle> suggestions;
    String message;
}
