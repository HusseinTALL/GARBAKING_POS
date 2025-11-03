package com.garbaking.analyticsservice.controller;

import com.garbaking.analyticsservice.dto.BudgetSuggestionBundle;
import com.garbaking.analyticsservice.dto.BudgetSuggestionRequest;
import com.garbaking.analyticsservice.dto.BudgetSuggestionResponse;
import com.garbaking.analyticsservice.service.BudgetRecommendationService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecommendationController.class);
    private final BudgetRecommendationService recommendationService;

    public RecommendationController(BudgetRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/budget")
    public ResponseEntity<BudgetSuggestionResponse> recommend(@RequestBody BudgetSuggestionRequest request) {
        LOGGER.info("Generating budget suggestions for budget={} preferences={}", request.getBudget(), request.getPreferences());
        List<BudgetSuggestionBundle> suggestions = recommendationService.generateSuggestions(request);
        BudgetSuggestionResponse response = BudgetSuggestionResponse
            .builder()
            .success(true)
            .suggestions(suggestions)
            .message("Budget suggestions generated")
            .build();
        return ResponseEntity.ok(response);
    }
}
