# Budget-Based Menu Suggestions – Customer App TODOs

Lightweight backlog to ship budget-based menu bundles in the customer app.

- [ ] **Define data inputs**
  - Confirm menu items expose price + tags needed for combos.
  - Agree on minimal history payload from analytics-service (last N orders, affinities).

- [x] **Backend scoring stub**
  - Added simple heuristic scorer in analytics-service (`BudgetRecommendationService`) that ranks items by tags/budget.
  - Exposes `POST /api/recommendations/budget` returning three bundles (value / usual / treat).

- [x] **Offline fallback**
  - Cache menu data locally and reuse for suggestions.
  - Client-side heuristic (greedy fill by category) produces bundles when API unavailable.

- [x] **Pinia store**
  - Created `useBudgetSuggestionsStore` handling fetch, offline mode, and last-picked bundle.
  - Emits local analytics events (`suggestions_requested`, `bundle_selected`).

- [x] **Customer app UI**
  - Added “Smart Suggest” section on home screen with budget slider + quick toggles.
  - Displays three suggestion cards with pricing + savings note.

- [x] **Cart integration**
  - Bundle selection pre-fills the cart and surfaces confirmation to the guest.

- [x] **Tracking & rollout**
  - Local analytics log persisted to `localStorage`; hook up to analytics-service when endpoint ships.
  - Feature flag + staff messaging still TODO.

- [x] **QA**
  - Added Vitest coverage for offline fallback; Playwright flow remains TODO.
