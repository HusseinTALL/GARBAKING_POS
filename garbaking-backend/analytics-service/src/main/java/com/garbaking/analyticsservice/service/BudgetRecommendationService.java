package com.garbaking.analyticsservice.service;

import com.garbaking.analyticsservice.dto.BudgetSuggestionBundle;
import com.garbaking.analyticsservice.dto.BudgetSuggestionItem;
import com.garbaking.analyticsservice.dto.BudgetSuggestionRequest;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;

@Service
public class BudgetRecommendationService {

    private static final List<MenuCandidate> CANDIDATES = List.of(
        new MenuCandidate("1", "Attiéké + Poisson", new BigDecimal("2500"), "Plats Authentiques", List.of("SEAFOOD", "GARBA", "HEARTY"), true, false),
        new MenuCandidate("2", "Attiéké + Thon", new BigDecimal("2200"), "Plats Authentiques", List.of("FRESH", "GARBA"), true, false),
        new MenuCandidate("3", "Poulet Yassa", new BigDecimal("2800"), "Plats Authentiques", List.of("SPICY", "LUNCH"), false, false),
        new MenuCandidate("4", "Alloco + Omelette", new BigDecimal("1500"), "Snacks & Street Food", List.of("VEGETARIAN", "POPULAR"), true, true),
        new MenuCandidate("5", "Alloco + Poisson", new BigDecimal("1800"), "Snacks & Street Food", List.of("FAVORITE", "GARBA"), true, false),
        new MenuCandidate("6", "Sandwich Viande Kankan", new BigDecimal("2000"), "Snacks & Street Food", List.of("LUNCH", "SANDWICH"), false, false),
        new MenuCandidate("7", "Jus de Bissap", new BigDecimal("800"), "Boissons Rafraîchissantes", List.of("DRINK", "BREAKFAST"), true, true),
        new MenuCandidate("8", "Gingembre pressé", new BigDecimal("900"), "Boissons Rafraîchissantes", List.of("DRINK", "SPICY"), true, true),
        new MenuCandidate("9", "Smoothie Papaye", new BigDecimal("1300"), "Boissons Rafraîchissantes", List.of("VEGAN", "BREAKFAST"), true, true),
        new MenuCandidate("10", "Cake Banane", new BigDecimal("1200"), "Desserts & Douceurs", List.of("SWEET", "SNACK"), true, false),
        new MenuCandidate("11", "Salade Avocat Douceur", new BigDecimal("1600"), "Salades & Fraîcheur", List.of("VEGAN", "LIGHT"), true, true),
        new MenuCandidate("12", "Tchep Garba", new BigDecimal("3000"), "Plats Authentiques", List.of("SPICY", "DINNER"), false, false)
    );

    public List<BudgetSuggestionBundle> generateSuggestions(BudgetSuggestionRequest request) {
        BigDecimal budget = request.getBudget() == null ? BigDecimal.valueOf(5000) : request.getBudget();
        BudgetSuggestionRequest.Preferences preferences = request.getPreferences();
        Locale locale = determineLocale(request);
        int partySize = resolvePartySize(request);

        List<MenuCandidate> filtered = filterByPreferences(CANDIDATES, preferences);

        if (filtered.isEmpty()) {
            filtered = CANDIDATES;
        }

        BudgetSuggestionBundle valueBundle = buildBundle("VALUE", "Budget malin", filtered, budget, locale, partySize);
        BudgetSuggestionBundle usualBundle = buildBundle("USUAL", "Comme d'habitude", prioritizeByTags(filtered, preferences), budget, locale, partySize);
        BudgetSuggestionBundle treatBundle = buildBundle("TREAT", "Petite folie", filtered.stream().sorted(Comparator.comparing(MenuCandidate::price).reversed()).toList(), budget, locale, partySize);

        return Stream.of(valueBundle, usualBundle, treatBundle)
            .map(bundle -> ensureTotals(bundle, budget))
            .collect(Collectors.toList());
    }

    private int resolvePartySize(BudgetSuggestionRequest request) {
        if (request.getContext() == null || request.getContext().getPartySize() == null) {
            return 1;
        }
        int value = request.getContext().getPartySize();
        return Math.max(1, Math.min(12, value));
    }

    private List<MenuCandidate> filterByPreferences(List<MenuCandidate> source, BudgetSuggestionRequest.Preferences preferences) {
        if (preferences == null || preferences.getDietary().isEmpty()) {
            return source;
        }

        boolean wantVegan = containsIgnoreCase(preferences.getDietary(), "VEGAN");
        boolean wantVegetarian = wantVegan || containsIgnoreCase(preferences.getDietary(), "VEGETARIAN");

        return source.stream()
            .filter(candidate -> {
                if (wantVegan) {
                    return candidate.vegan();
                }
                if (wantVegetarian) {
                    return candidate.vegetarian();
                }
                return true;
            })
            .collect(Collectors.toList());
    }

    private List<MenuCandidate> prioritizeByTags(List<MenuCandidate> source, BudgetSuggestionRequest.Preferences preferences) {
        if (preferences == null || preferences.getTags().isEmpty()) {
            return source;
        }

        return source.stream()
            .sorted(Comparator
                .comparingInt((MenuCandidate candidate) -> matchScore(candidate, preferences.getTags()))
                .reversed()
                .thenComparing(MenuCandidate::price))
            .collect(Collectors.toList());
    }

    private int matchScore(MenuCandidate candidate, List<String> requestedTags) {
        return (int) requestedTags.stream()
            .map(String::toUpperCase)
            .filter(tag -> candidate.tags().stream().map(String::toUpperCase).anyMatch(tag::equals))
            .count();
    }

    private BudgetSuggestionBundle buildBundle(String strategy, String title, List<MenuCandidate> candidates, BigDecimal budget, Locale locale, int partySize) {
        if (candidates.isEmpty()) {
            return BudgetSuggestionBundle
                .builder()
                .id(strategy + "-" + UUID.randomUUID())
                .title(title)
                .description("Aucune suggestion disponible")
                .total(BigDecimal.ZERO)
                .savings(BigDecimal.ZERO)
                .highlight(String.format(locale, "Pour %d convive%s · Aucun élément disponible", partySize, partySize > 1 ? "s" : ""))
                .tags(List.of(strategy))
                .items(List.of())
                .build();
        }

        BundleBuilderContext context = new BundleBuilderContext();

        for (MenuCandidate candidate : candidates) {
            if (context.isEmpty() || context.getTotal().add(candidate.price()).compareTo(budget) <= 0) {
                context.add(candidate);
            }
            if (context.getTotal().compareTo(budget.multiply(BigDecimal.valueOf(0.85))) >= 0) {
                break;
            }
        }

        List<MenuCandidate> fillerPool = candidates.stream()
            .sorted(Comparator.comparing(MenuCandidate::price))
            .toList();

        int guard = 0;
        while (context.getServings() < partySize && !fillerPool.isEmpty()) {
            MenuCandidate candidate = fillerPool.get(guard % fillerPool.size());
            if (context.getTotal().add(candidate.price()).compareTo(budget) > 0) {
                guard++;
                if (guard > fillerPool.size() * 3) {
                    break;
                }
                continue;
            }
            context.add(candidate);
            guard++;
        }

        List<BudgetSuggestionItem> items = context.buildItems();
        BigDecimal total = context.getTotal();
        String highlight = composeHighlight(strategy, locale, budget, total, partySize, context.getServings());

        return BudgetSuggestionBundle
            .builder()
            .id(strategy + "-" + UUID.randomUUID())
            .title(title)
            .description(strategy.equals("VALUE")
                ? "Une sélection optimisée pour rester sous votre budget"
                : strategy.equals("USUAL")
                    ? "Un mix équilibré basé sur vos derniers choix"
                    : "Un combo premium pour se faire plaisir")
            .total(total)
            .savings(savings(budget, total))
            .highlight(highlight)
            .tags(List.of(strategy))
            .items(items)
            .build();
    }

    private String composeHighlight(String strategy, Locale locale, BigDecimal budget, BigDecimal total, int partySize, int servings) {
        String partyPhrase = String.format(locale, "Pour %d convive%s", partySize, partySize > 1 ? "s" : "");
        if (servings < partySize) {
            return String.format(locale, "%s · Portions disponibles: %d/%d", partyPhrase, servings, partySize);
        }

        String base = switch (strategy) {
            case "VALUE" -> String.format(locale, "Économisez ~%s FCFA", savings(budget, total).toPlainString());
            case "USUAL" -> "Inspiré de vos préférences récentes";
            case "TREAT" -> "Ajoutez une boisson pour compléter";
            default -> "Suggestion personnalisée";
        };

        return String.format(locale, "%s · %s", partyPhrase, base);
    }

    private BudgetSuggestionBundle ensureTotals(BudgetSuggestionBundle bundle, BigDecimal budget) {
        if (!bundle.getItems().isEmpty()) {
            BigDecimal total = bundle.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            return bundle.toBuilder()
                .total(total)
                .savings(savings(budget, total))
                .build();
        }
        return bundle;
    }

    private BigDecimal savings(BigDecimal budget, BigDecimal total) {
        BigDecimal savings = budget.subtract(total);
        if (savings.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return savings.setScale(0, RoundingMode.HALF_UP);
    }

    private boolean containsIgnoreCase(List<String> items, String probe) {
        return items.stream().anyMatch(item -> item != null && item.equalsIgnoreCase(probe));
    }

    private Locale determineLocale(BudgetSuggestionRequest request) {
        String localeValue = request.getContext() != null ? request.getContext().getLocale() : null;
        if (localeValue == null || localeValue.isBlank()) {
            return Locale.FRANCE;
        }
        return Locale.forLanguageTag(localeValue);
    }

    private static class BundleBuilderContext {
        private final Map<String, BudgetSuggestionItem> items = new LinkedHashMap<>();
        private BigDecimal total = BigDecimal.ZERO;
        private int servings = 0;

        void add(MenuCandidate candidate) {
            items.compute(candidate.id(), (key, existing) -> {
                servings += 1;
                total = total.add(candidate.price());
                if (existing == null) {
                    return toItem(candidate);
                }
                return existing.toBuilder()
                    .quantity(existing.getQuantity() + 1)
                    .build();
            });
        }

        boolean isEmpty() {
            return items.isEmpty();
        }

        BigDecimal getTotal() {
            return total;
        }

        int getServings() {
            return servings;
        }

        List<BudgetSuggestionItem> buildItems() {
            return new ArrayList<>(items.values());
        }

        private static BudgetSuggestionItem toItem(MenuCandidate candidate) {
            return BudgetSuggestionItem
                .builder()
                .menuItemId(candidate.id())
                .name(candidate.name())
                .price(candidate.price())
                .quantity(1)
                .categoryName(candidate.category())
                .build();
        }
    }

    private record MenuCandidate(
        String id,
        String name,
        BigDecimal price,
        String category,
        List<String> tags,
        boolean vegetarian,
        boolean vegan
    ) { }
}
