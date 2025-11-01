package com.garbaking.analyticsservice.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BudgetSuggestionRequest {
    @Builder.Default
    BigDecimal budget = BigDecimal.valueOf(5000);
    Preferences preferences;
    Context context;

    @Value
    @Builder
    public static class Preferences {
        @Builder.Default
        List<String> dietary = List.of();
        String timeOfDay;
        @Builder.Default
        List<String> tags = List.of();
    }

    @Value
    @Builder
    public static class Context {
        String customerId;
        @Builder.Default
        List<String> recentOrderIds = List.of();
        String locale;
        @Builder.Default
        Integer partySize = 1;
    }
}
