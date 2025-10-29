package com.garbaking.common.observability;

/**
 * Contract for publishing operational alerts to downstream systems. The default implementation
 * logs alerts in a structured format that can be scraped by centralized logging.
 */
public interface AlertPublisher {

    void publish(AlertEvent event);

    default void publish(String type, AlertSeverity severity, String message) {
        publish(AlertEvent.builder(type, severity).message(message).build());
    }
}
