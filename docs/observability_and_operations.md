# Observability & Operations

This phase wires a consistent observability stack across every Spring Boot microservice so the
Vue dashboards and operational tooling have actionable telemetry.

## Distributed Tracing
- Micrometer tracing with Brave exports spans to Zipkin at `http://localhost:9411/api/v2/spans`.
- Sampling defaults to 20–40% depending on the service; override with
  `management.tracing.sampling.probability` in service configuration.
- B3 and W3C propagation headers are enabled to keep requests correlated across the gateway and
  downstream services.

## Structured Logging
- All services share `logback-structured.xml` (packaged via `common-libs`) which emits JSON logs
  through `logstash-logback-encoder`.
- Alerts are written to the dedicated `garbaking-alerts` logger so Logstash/Fluent Bit pipelines can
  route them to PagerDuty or Slack.

## Prometheus Metrics
- Actuator Prometheus exporters are enabled on every service via
  `/actuator/prometheus`.
- New business KPIs exposed:
  - `garbaking_auth_failures_total`, `garbaking_auth_success_total`,
    `garbaking_auth_failure_window`
  - `garbaking_order_backlog_total`, `garbaking_order_pending_payments_total`
  - `garbaking_inventory_low_stock_total`, `garbaking_inventory_out_of_stock_total`
- Each module tags metrics with `service` and `environment` labels to simplify Grafana dashboards.

## Alerting Hooks
- Shared `AlertPublisher` auto-configuration publishes structured warnings when thresholds are
  crossed. Default thresholds are tuned for local development but can be overridden per service with
  the `garbaking.observability.alerts.*` properties.
- User Service: emits alerts when authentication failures within the evaluation window exceed the
  configured threshold.
- Order Service: warns when the order backlog grows beyond acceptable limits.
- Inventory Service: raises warnings when low-stock items breach the configured buffer.

## Next Steps
- Connect the JSON logs to your ELK/EFK stack to unlock search and alert routing.
- Scrape the Prometheus endpoints and import the provided metric names into Grafana dashboards.
- Configure Zipkin retention policies that align with production traffic volumes.
