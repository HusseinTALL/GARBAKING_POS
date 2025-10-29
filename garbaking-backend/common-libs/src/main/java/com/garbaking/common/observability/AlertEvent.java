package com.garbaking.common.observability;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Structured payload describing an operational alert emitted by a service.
 */
public final class AlertEvent {

    private final String type;
    private final AlertSeverity severity;
    private final String message;
    private final Map<String, Object> context;
    private final Instant timestamp;

    private AlertEvent(Builder builder) {
        this.type = builder.type;
        this.severity = builder.severity;
        this.message = builder.message;
        this.context = Collections.unmodifiableMap(new LinkedHashMap<>(builder.context));
        this.timestamp = builder.timestamp != null ? builder.timestamp : Instant.now();
    }

    public String getType() {
        return type;
    }

    public AlertSeverity getSeverity() {
        return severity;
    }

    public String getMessage() {
        return message;
    }

    public Map<String, Object> getContext() {
        return context;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public static Builder builder(String type, AlertSeverity severity) {
        return new Builder(type, severity);
    }

    /**
     * Builder for {@link AlertEvent} to simplify creation in services.
     */
    public static final class Builder {
        private final String type;
        private final AlertSeverity severity;
        private String message = "";
        private Instant timestamp;
        private final Map<String, Object> context = new LinkedHashMap<>();

        private Builder(String type, AlertSeverity severity) {
            this.type = type;
            this.severity = severity;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder timestamp(Instant timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder putContext(String key, Object value) {
            this.context.put(key, value);
            return this;
        }

        public AlertEvent build() {
            return new AlertEvent(this);
        }
    }
}
