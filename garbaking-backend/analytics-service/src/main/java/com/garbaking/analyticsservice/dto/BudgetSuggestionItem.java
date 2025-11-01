package com.garbaking.analyticsservice.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class BudgetSuggestionItem {
    String menuItemId;
    String name;
    BigDecimal price;
    @Builder.Default
    int quantity = 1;
    String imageUrl;
    String categoryName;
}
