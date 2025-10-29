# Order Service WebSocket Integration

## Overview
The order service now exposes two complementary WebSocket endpoints so that both STOMP-aware clients and legacy raw JSON clients remain functional:

- `ws://<host>:<port>/ws/orders` – STOMP over WebSocket with SockJS fallback (existing behaviour).
- `ws://<host>:<port>/ws/orders/raw` – Plain WebSocket endpoint that accepts raw JSON payloads from the Vue applications.

The raw endpoint accepts payloads with an optional `destination` key. Messages are re-broadcast to the internal STOMP broker so that downstream listeners stay in sync. Every message receives an acknowledgement frame (`{"status":"ack"}`) to simplify client-side queuing.

## Broadcasting Strategy
`WebSocketService` now fans out every order event to both the STOMP broker and connected raw sessions. All real-time updates (`created`, `updated`, `status`, `cancelled`, and active order snapshots) are mirrored automatically.

## Client Guidance
- Vue clients that still use a bare WebSocket should switch to `/ws/orders/raw` and send JSON payloads that include `destination` when routing is required. Incoming messages will mirror the STOMP payloads.
- STOMP clients can continue to subscribe to `/topic/orders/**` channels without any changes.

## Kafka Topics
The service provisions the following Kafka topics at startup: `order.created`, `order.status.changed`, `order.payment.updated`, and `order.cancelled`. A lightweight listener (`KafkaOrderEventListener`) logs deliveries which can be swapped for downstream consumers when available.
