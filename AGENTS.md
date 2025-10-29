# Repository Guidelines

## Project Structure & Module Organization
- `garbaking-backend/` hosts the Spring Boot stack: infrastructure services (`config-server`, `discovery-server`, `api-gateway`) and domain services (`user-service`, `order-service`, `inventory-service`). Each module follows the standard `src/main/java`, `src/main/resources`, `src/test/java` layout with shared classes in `common-libs/`.
- `frontend/` contains the Vue 3 workspaces (`admin-pos/`, `customer-app/`, `kds-app/`), each with a standalone `src/`, `tests/`, and `public/`.
- `hardware/` provides Raspberry Pi provisioning scripts; `docker/` and `garbaking-backend/docker/` hold compose files for MySQL, Kafka, and Zipkin; `docs/` captures architecture and rollout notes.
- Root-level scripts (`start-all.sh`, `stop-all.sh`, `status.sh`, `view-logs.sh`) coordinate microservices plus frontends, while `logs/` aggregates runtime output.

## Build, Test, and Development Commands
- `npm install` (repo root) bootstraps the Vue workspaces; run inside each app for targeted dependency updates.
- `cd garbaking-backend && ./gradlew clean build` compiles every microservice and produces fat JARs beneath each module’s `build/libs/`.
- `./gradlew {service}:bootRun` (e.g., `./gradlew api-gateway:bootRun`) starts an individual Spring Boot service with the development profile.
- `./start-all.sh` launches Docker infrastructure, Spring services, and all Vite dev servers; `./stop-all.sh` tears everything down cleanly.
- `npm run build` bundles the frontends, while `npm run lint` / `npm run format` keep JavaScript/TypeScript code consistent.

## Coding Style & Naming Conventions
- Java services target Java 17; adhere to Spring conventions (package-per-feature, `@Service`/`@Controller` naming) and 4-space indentation. Lombok is available—keep annotations (`@Data`, `@Builder`) consistent inside `common-libs`.
- TypeScript is the default for frontends; Prettier enforces 2-space indentation and trailing commas. Use PascalCase for Vue components, camelCase for stores/composables, and kebab-case filenames under `src/components`.
- Frontend state stores live in `src/stores`, API clients in `src/services`, and shared utilities in `frontend/shared`.
- Always run `npm run lint:frontend` before committing UI changes; Java formatting should pass `./gradlew check` without warnings.

## Testing Guidelines
- Java services use JUnit 5 and Testcontainers; run `cd garbaking-backend && ./gradlew test` before pushing. Aim for ≥80% coverage on new business modules and document any gaps.
- Frontend unit tests rely on Vitest (`npm run test:frontend`), while Playwright specs (`npm run test:e2e` from `frontend/admin-pos`) cover end-to-end flows; add snapshots or fixtures when asserting UI state.
- Mirror feature names in test classes (`OrderServiceTest.java`, `OrderSummary.spec.ts`) and co-locate integration fixtures under `src/test/resources`.

## Commit & Pull Request Guidelines
- Prefer Conventional Commit prefixes (`feat:`, `fix:`, `chore:`); keep subject lines ≤72 chars and describe scope (`fix: auth apply /api prefix`).
- Each PR should summarize functional changes, list verification steps (commands run, screenshots for UI tweaks), and reference Jira/GitHub issues when applicable.
- Rebase onto `main` before requesting review, confirm `npm run lint` and `npm run test` pass, and ensure config or schema changes note any migration steps in the PR body.
