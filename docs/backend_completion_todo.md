# Garbaking Backend Completion To-Do

This checklist compiles the outstanding work required for the Spring Boot backend to align with the Vue.js frontends. Items are grouped by responsibility area and should be refined into issues/epics before implementation.

## 1. Platform & Infrastructure
- [ ] **Config / Discovery**
  - [ ] Externalize per-service configuration (profiles, datasource URLs, Kafka) and document bootstrap order.
  - [ ] Add health/readiness probes and service registration tests.
- [ ] **API Gateway**
  - [ ] Implement JWT verification filter, token-to-header propagation, and exception handling.
  - [ ] Restore missing `CorsConfig` and enforce CORS policies for admin, customer, and KDS origins.
  - [ ] Add refresh/logout endpoints or proxying to user-service once implemented.
  - [ ] Provide WebSocket/STOMP proxy or adjust client connections for order updates.
  - [ ] Harden route definitions with rate limiting, timeouts, and service discovery integration.
- [ ] **Deployment Tooling**
  - [ ] Supply Docker/Kubernetes manifests for all services with environment variables, secrets, and scaling hints.
  - [ ] Automate topic/database provisioning in infrastructure scripts.

## 2. Security & Identity
- [ ] Enable `@EnableMethodSecurity(prePostEnabled = true)` and audit controller/service annotations across services.
- [ ] Replace permissive `SecurityFilterChain` with role-based policies that match frontend personas (admin, cashier, kitchen, customer).
- [ ] Implement refresh token issuance, storage, and revocation (DB or Redis) with `/api/auth/refresh` and `/api/auth/logout` endpoints.
- [ ] Add `/api/auth/verify` endpoint for session heartbeat used by frontends.
- [ ] Document password reset flow and integrate email/SMS providers as required by UI.
- [ ] Provide audit logging for authentication events.

## 3. User Service Enhancements
- [ ] Expand REST API to cover:
  - [ ] Staff creation/update including role/permission management.
  - [ ] `/api/users/me` backed by authenticated principal instead of `X-User-Id` header reliance.
  - [ ] Clock-in/out endpoints and clock entry history management.
  - [ ] Audit log retrieval, staff preferences, and performance metrics consumed by admin UI.
  - [ ] Password reset requests and token-based resets.
- [ ] Add DTO validation, error handling, and consistent response envelopes.
- [ ] Integrate method-level authorization checks.
- [ ] Write unit/integration tests for controllers, services, repositories.

## 4. Order Service Enhancements
- [ ] Align analytics endpoints with frontend expectations (payment method breakdown, time-based analytics, comparison exports, etc.).
- [ ] Reconcile WebSocket protocol (STOMP vs raw JSON) with frontend apps and update documentation.
- [ ] Harden order status transitions with validation and idempotency controls.
- [ ] Configure Kafka topics/consumers or replace with alternative eventing strategy.
- [ ] Provide reporting endpoints for receipts, printer queues, and loyalty hooks if required by UI.
- [ ] Add service-level tests (unit, integration, WebSocket messaging).

## 5. Inventory Service Enhancements
- [ ] Implement image upload handling (multipart storage, CDN integration, signed URLs).
- [ ] Add Kafka consumer/producer wiring for stock notifications and audit logs.
- [ ] Expose endpoints for featured item curation, inventory audits, and supplier integrations as surfaced in frontend.
- [ ] Ensure stock adjustment flows enforce business rules and produce events for downstream analytics.
- [ ] Add coverage with unit and integration tests.

## 6. Cross-Cutting Analytics & Additional Services
- [ ] Design and implement services for loyalty, table/floor management, receipts, printers, and payment processing to match Vue modules.
- [ ] Evaluate whether to split analytics into dedicated microservice or enhance existing services.
- [ ] Define reporting exports (CSV/PDF) and scheduled jobs required by dashboards.

## 7. Data Management
- [ ] Introduce Flyway/Liquibase migrations per service with isolated schemas or schema prefixes.
- [ ] Audit entity relationships for multi-service collisions and adjust naming strategies.
- [ ] Establish seed data scripts for development/testing.
- [ ] Configure backup, retention, and migration documentation.

## 8. Messaging & Integrations
- [ ] Provision Kafka topics and broker configuration scripts; define retention and partition strategy.
- [ ] Implement consumers in services that subscribe to order/inventory events.
- [ ] Document message contracts and versioning strategy.
- [ ] Explore alternative queues if Kafka proves excessive for current scope.

## 9. Observability & Operations
- [ ] Enable Zipkin tracing with meaningful sampling rates; ensure spans propagate across services.
- [ ] Add centralized logging (ELK/EFK) configuration and structured log formats.
- [ ] Publish Prometheus metrics and dashboards for key business KPIs.
- [ ] Implement alerting for auth failures, stock thresholds, order backlog, etc.

## 10. Testing & Quality Assurance
- [ ] Build integration test suites per service (API contract tests, repository tests with Testcontainers).
- [ ] Create end-to-end tests that exercise gateway, authentication, and order flow with frontend clients.
- [ ] Set up CI pipelines running linting, tests, and security scanners (OWASP dependency check, Snyk, etc.).
- [ ] Add performance/load testing scenarios for peak hours.

## 11. Documentation & Developer Experience
- [ ] Update API documentation (OpenAPI/Swagger) across services and publish aggregated docs.
- [ ] Provide onboarding guide describing local setup, environment variables, and debugging steps.
- [ ] Maintain changelog and architecture decision records for major design choices.
- [ ] Ensure README references new services/endpoints and cross-links to frontend usage guides.

## 12. Delivery Checklist
- [ ] Define release process including versioning, tagging, and rollback steps.
- [ ] Run penetration and security audits before production deployment.
- [ ] Confirm GDPR/PCI compliance depending on stored customer/payment data.
- [ ] Schedule knowledge transfer and incident response runbooks.

