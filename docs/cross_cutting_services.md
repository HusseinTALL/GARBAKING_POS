# Cross-Cutting Services Overview

This document captures the Spring Boot services introduced to satisfy the Vue admin modules
for loyalty, floor management, receipts, printers, payments, and cross-service analytics.

## Operations Service

* **Base URL:** `/api/` via the API gateway.
* **Capabilities:**
  - Loyalty members, rewards, and points management (`/loyalty/**`).
  - Floor/table layout, reservations, and live availability (`/tables/**`).
  - Receipt generation and CSV/PDF exports (`/receipts/**`).
  - Printer registration, status updates, and print job queues (`/printers/**`).
  - Payment method governance, charge/refund flows, and transaction listings (`/payments/**`).
  - Aggregated snapshot for downstream analytics (`/operations/summary`).
* **Implementation details:** In-memory stores with validation guardrails, deterministic ID
  generation, and summary metrics suitable for dashboard widgets.

## Analytics Service

* **Base URL:** `/api/analytics/cross-cutting/**` via the API gateway.
* **Responsibilities:**
  - Polls the Operations service for consolidated operational metrics.
  - Generates CSV or PDF-friendly payloads encoded as Base64 for download and export jobs.
  - Maintains schedule definitions (cron + recipient list) for future background delivery.
  - Publishes a refresh endpoint plus a scheduled job that recalculates the snapshot every 15 minutes.

## Gateway Updates

* `/api/loyalty`, `/api/tables`, `/api/receipts`, `/api/printers`, `/api/payments`, and `/api/operations`
  now route to the `operations-service`.
* `/api/analytics/cross-cutting/**` routes to the new `analytics-service`, while
  `/api/analytics/orders/**` continues to forward to the order-service.

These additions unblock the Vue dashboards, receipt tooling, and loyalty modules so frontend
integrations can exercise real endpoints without waiting on database integrations or Kafka pipelines.
