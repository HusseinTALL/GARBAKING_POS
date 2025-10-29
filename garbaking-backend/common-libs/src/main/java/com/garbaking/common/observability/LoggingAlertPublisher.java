package com.garbaking.common.observability;

import net.logstash.logback.argument.StructuredArguments;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Default {@link AlertPublisher} that writes structured alert events to the application log.
 */
public class LoggingAlertPublisher implements AlertPublisher {

    private static final Logger LOGGER = LoggerFactory.getLogger("garbaking-alerts");
    private final String serviceName;

    public LoggingAlertPublisher(String serviceName) {
        this.serviceName = serviceName;
    }

    @Override
    public void publish(AlertEvent event) {
        LOGGER.warn(
                "operational_alert",
                StructuredArguments.keyValue("service", serviceName),
                StructuredArguments.keyValue("alertType", event.getType()),
                StructuredArguments.keyValue("severity", event.getSeverity().name()),
                StructuredArguments.keyValue("timestamp", event.getTimestamp().toString()),
                StructuredArguments.entries(event.getContext())
        );
    }
}
