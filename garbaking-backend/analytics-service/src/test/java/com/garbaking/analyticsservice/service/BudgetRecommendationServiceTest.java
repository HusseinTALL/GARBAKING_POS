package com.garbaking.analyticsservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.garbaking.analyticsservice.dto.BudgetSuggestionBundle;
import com.garbaking.analyticsservice.dto.BudgetSuggestionRequest;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BudgetRecommendationServiceTest {

    private BudgetRecommendationService service;

    @BeforeEach
    void setUp() {
        service = new BudgetRecommendationService();
    }

    @Test
    void generatesThreeBundlesWithinBudget() {
        BudgetSuggestionRequest request = BudgetSuggestionRequest
            .builder()
            .budget(BigDecimal.valueOf(5000))
            .preferences(BudgetSuggestionRequest.Preferences
                .builder()
                .dietary(List.of())
                .build())
            .build();

        List<BudgetSuggestionBundle> bundles = service.generateSuggestions(request);

        assertThat(bundles).hasSize(3);
        bundles.forEach(bundle -> {
            assertThat(bundle.getItems()).isNotEmpty();
            assertThat(bundle.getTotal()).isLessThanOrEqualTo(BigDecimal.valueOf(5000));
        });
    }

    @Test
    void appliesDietaryPreferenceForVegan() {
        BudgetSuggestionRequest request = BudgetSuggestionRequest
            .builder()
            .budget(BigDecimal.valueOf(4000))
            .preferences(BudgetSuggestionRequest.Preferences
                .builder()
                .dietary(List.of("VEGAN"))
                .build())
            .build();

        List<BudgetSuggestionBundle> bundles = service.generateSuggestions(request);

        assertThat(bundles).isNotEmpty();
        bundles.forEach(bundle ->
            bundle.getItems().forEach(item ->
                assertThat(item.getName()).doesNotContainIgnoringCase("Poulet").doesNotContainIgnoringCase("Poisson")
            ));
    }

    @Test
    void scalesServingsToPartySizeWhenBudgetAllows() {
        BudgetSuggestionRequest request = BudgetSuggestionRequest
            .builder()
            .budget(BigDecimal.valueOf(12000))
            .context(BudgetSuggestionRequest.Context
                .builder()
                .partySize(4)
                .build())
            .build();

        List<BudgetSuggestionBundle> bundles = service.generateSuggestions(request);

        assertThat(bundles).isNotEmpty();
        bundles.forEach(bundle -> {
            int servings = bundle.getItems().stream()
                .mapToInt(item -> item.getQuantity())
                .sum();
            assertThat(servings).isGreaterThanOrEqualTo(4);
            assertThat(bundle.getTotal()).isLessThanOrEqualTo(BigDecimal.valueOf(12000));
        });
    }
}
