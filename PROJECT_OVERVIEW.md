# Garbaking POS – Repository Overview

## Purpose
- Offline-first point of sale platform for bakeries and quick-service restaurants.
- Coordinates ordering, kitchen production, payments, and analytics across in-store tablets and remote cloud services.
- Designed to keep operating through connectivity loss, resyncing data once network access returns.

## Frontend Suite
- Three Vue 3 + TypeScript applications under `frontend/`: `admin-pos` for counter staff, `customer-app` for self-service ordering, and `kds-app` for the kitchen display.
- Shared UI utilities and state patterns (Pinia, VueUse, Tailwind CSS) support responsive layouts and progressive web app behaviour.
- Real-time order visibility uses Socket.IO/STOMP clients alongside offline storage with IndexedDB (`idb`) to queue actions while offline.

## Spring Boot Microservices
- Infrastructure layer (`config-server`, `discovery-server`, `api-gateway`) centralises configuration, service discovery (Eureka), and JWT-secured routing at port 8080.
- Business services cover `user-service` (fully implemented authentication and roles), `order-service`, `inventory-service`, `analytics-service`, and `operations-service`, all sharing DTOs and security helpers from `common-libs/`.
- MySQL instances (via Docker Compose) back each domain; Kafka topics transport user/order events; Zipkin traces requests during debugging.

## Data Flow & Integrations
- Orders enter through the gateway, persist to service-specific stores, and broadcast over WebSocket/STOMP for live dashboards and printer cues.
- Offline clients stage work locally, then sync through REST endpoints with idempotency protections described in `docs/POS_OFFLINE_SYNC_REPORT.md`.
- Hardware scripts under `hardware/` provision Raspberry Pi terminals, configure captive Wi-Fi, and install thermal printer drivers for ESC/POS-compatible printers.

## Operations & Tooling
- Root scripts (`start-all.sh`, `stop-all.sh`, `status.sh`, `view-logs.sh`) orchestrate Docker infrastructure, Spring services, and Vite dev servers.
- Java builds rely on Gradle (`./gradlew clean build`, service-specific `bootRun`), with Testcontainers-backed JUnit suites targeted at ≥80% coverage.
- Frontend workspaces use Vite for development, Vitest/Playwright for testing, and linting via `npm run lint` per the repository guidelines.

## Documentation & Roadmap
- Extensive specs in `docs/` cover system requirements, rollout plans, AI-driven roadmap ideas, and detailed implementation checklists.
- `garbaking-backend/README.md` tracks service readiness (user service complete; order/inventory in progress) and operational runbooks.
- Additional root notes (e.g., `CURRENT_STATUS_AND_NEXT_STEPS.md`, `BACKEND_TROUBLESHOOTING.md`) log migration history from the earlier Node/Prisma stack and capture outstanding engineering tasks.
