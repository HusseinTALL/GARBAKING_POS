package com.garbaking.analyticsservice.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class BudgetSuggestionBundle {
    String id;
    String title;
    String description;
    BigDecimal total;
    BigDecimal savings;
    String highlight;
    @Builder.Default
    List<String> tags = List.of();
    @Builder.Default
    List<BudgetSuggestionItem> items = List.of();
    @Builder.Default
    String source = "REMOTE";
}
