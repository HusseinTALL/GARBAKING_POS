Findings

  - Dual API clients – api.ts (legacy structure returning { success, data }) is still imported by the kitchen store, loyalty service, and upload service while the rest of the app has been moved to api-
    spring.ts. The mixed contracts make the stores brittle and hide failed calls (e.g. kitchen expects response.data.orders while the Spring service already returns plain arrays).
  - Loyalty – services/loyalty.ts still targets old endpoints (/loyalty/customer/{id} etc.). The Spring “operations-service” exposes /api/loyalty/members… with different payloads (LoyaltyMember,
    LoyaltyTransaction). None of the new DTOs are consumed on the frontend, so the loyalty dashboard cannot load.
  - Uploads – uploadService posts to /api/upload/image, an endpoint that does not exist in the Spring stack. Inventory now exposes /api/menu-items/{id}/images…; the admin UI never calls these routes so
    menu images cannot be managed.
  - Kitchen view – stores/kitchen.ts still relies on apiService.orders (legacy) and expects filter options (include=orderItems.menuItem) that the Spring order service does not understand. The websocket
    integration points directly at http://localhost:8082/ws/orders, which works, but REST fallbacks and status mutations need to go through /api/orders/... and map to the new DTOs.
  - Tables / floor plans / payments / receipts – the store code is annotated “to be implemented” and still uses placeholder routes (/api/tables/{tableId}/status, /api/payment/process, /api/receipts/
    templates, etc.). The Spring operations service already ships controllers but with different shapes:
      - Tables: /api/tables/layout, PUT /api/tables/{id}/status, /api/tables/reservations.
      - Payments: /api/payments/charges|refunds|methods.
      - Printers & receipts: /api/printers/**, /api/receipts/**.
        The frontend never calls these actual paths, so those views silently fail.
  - Analytics duplication – analyticsApi.getDashboardStats() still synthesizes metrics client-side by fanning out to orders and inventory, even though /api/analytics/dashboard is now implemented.
    Several other analytics calls exist in the frontend but the backend DTOs return richer structures (DashboardAnalytics, SalesData, etc.) that are not consumed yet.
  - Type mismatches – many store types assume string IDs (e.g. PaymentMethod.id: string, LoyaltyCustomer.id: string) while the Spring services return numeric IDs (Long). Without adapters the UI hits
    runtime issues once real data flows in.
  - Configuration drift – environment defaults (API base, websocket URLs) are partially updated, but some components (admin websocket client, upload service) still rely on hard-coded ports or lack
    VITE_… fallbacks.

  ———

  Implementation Plan

  1. Unify API access layer
      - Retire services/api.ts and move the small set of remaining consumers (kitchen.ts, uploadService.ts, loyalty.ts) onto api-spring.ts.
      - Update those stores to expect the raw JSON the Spring services return (plain arrays/objects) and remove the legacy { success, data } wrapping.
      - Add lightweight response mappers inside api-spring.ts where Spring returns numeric IDs so the rest of the Vue stores can keep using typed objects (mapOrderDtoToKitchenOrder,
        mapPaymentMethodDto, etc.).
  2. Loyalty integration
      - Replace the /loyalty/customer/** calls with the operations-service routes (/api/loyalty/members, /api/loyalty/members/{id}/transactions, /api/loyalty/members/{id}/rewards/redeem, …).
      - Align the TypeScript interfaces with LoyaltyMember, LoyaltyTransaction, and update the store/views accordingly.
      - If the UI truly needs customer-centric endpoints (e.g. search by contact info), add the missing query endpoints to operations-service instead of faking them on the client.
  3. Menu asset uploads
      - Point uploadService at /api/menu-items/{menuItemId}/images (Inventory service) and extend the service to fetch the current image metadata after upload/delete.
      - Update the components that call uploadService to pass the menu item ID so the correct route is used, and surface backend validation errors (file size/type) to the UI.
  4. Kitchen board & order workflows
      - Swap stores/kitchen.ts over to ordersApi from api-spring.ts, remove the unsupported query parameters, and adapt the mapping to the OrderDTO shape (items already contain menuItemName,
        unitPrice).
      - Implement missing helper endpoints in order-service if the kitchen view needs filtered subsets (e.g. GET /orders/active already exists; if more granular filters are needed, add them server-
        side).
      - Ensure the websocket fallback uses the gateway URL (ws://{gateway}/ws/orders) so deployments behind the gateway keep working.
  5. Tables & reservations
      - Rewrite tablesApi and floorPlansApi to use operations-service routes: GET /api/tables/layout, PUT /api/tables/{id}/status, POST /api/tables/reservations, etc.
      - Update stores/tables.ts (and dependent components) to consume FloorSection/Reservation models from the backend instead of the placeholder format.
  6. Payments & receipts
      - Align paymentApi with /api/payments/charges|refunds|methods (operations-service). Remove unsupported calls (/cash-drawer, /process-split) or plan backend stories to add them.
      - Match the store types to PaymentTransaction and PaymentMethod.
      - Wire the receipt-related store/actions to /api/receipts and /api/printers endpoints; if the UI needs template management or printer testing that is not yet exposed, create the corresponding
        controller methods in operations-service.
  7. Analytics
      - Update analytics store to consume the DTOs returned by /api/analytics/** instead of re-computing figures client-side.
      - Delete or gate any analytics calls that the backend does not support yet (e.g. comparison/custom); raise backend tickets where the UI genuinely needs them.
  8. Type & format harmonisation
      - Audit all stores for assumptions about ID/string formats and adjust types to numeric (or introduce conversion helpers).
      - Centralise date/time formatting (most services return ISO strings; ensure the UI consistently parses them).
  9. Environment & configuration
      - Standardise on VITE_API_GATEWAY_URL, VITE_WS_URL, and VITE_ASSETS_URL (for images) across services and composables, with sensible defaults.
      - Document the required .env keys for running the admin POS against Spring backend.
  10. Validation & regression coverage
      - After each migration, add vitest store tests or component tests that stub the new Spring responses to catch serialization issues.
      - Smoke-test critical flows (menu management, order lifecycle, payment capture, analytics dashboards) against the seeded dataset from mock-data.sql.

  This sequence removes the legacy Node contract, brings every store in line with the Spring microservices, and sets the stage for any missing backend work (cash drawer, advanced loyalty analytics) to
  be tracked explicitly.