package com.garbaking.userservice.observability;

import com.garbaking.common.observability.AlertEvent;
import com.garbaking.common.observability.AlertPublisher;
import com.garbaking.common.observability.AlertSeverity;
import com.garbaking.common.observability.ObservabilityProperties;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AbstractAuthenticationFailureEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Captures authentication outcomes for Prometheus scraping and emits alerts when the number of
 * failures in the configured evaluation window exceeds the allowed threshold.
 */
@Component
public class AuthenticationMetricsListener {

    private final Counter authFailures;
    private final Counter authSuccess;
    private final AtomicInteger failureWindow = new AtomicInteger(0);
    private final ObservabilityProperties properties;
    private final AlertPublisher alertPublisher;

    public AuthenticationMetricsListener(
            MeterRegistry meterRegistry,
            ObservabilityProperties properties,
            AlertPublisher alertPublisher
    ) {
        this.properties = properties;
        this.alertPublisher = alertPublisher;
        this.authFailures = meterRegistry.counter("garbaking_auth_failures_total");
        this.authSuccess = meterRegistry.counter("garbaking_auth_success_total");
        meterRegistry.gauge("garbaking_auth_failure_window", failureWindow);
    }

    @EventListener
    public void handleFailure(AbstractAuthenticationFailureEvent event) {
        authFailures.increment();
        failureWindow.incrementAndGet();
    }

    @EventListener
    public void handleSuccess(AuthenticationSuccessEvent event) {
        authSuccess.increment();
    }

    @Scheduled(fixedDelayString = "${garbaking.observability.alerts.evaluation-interval:PT5M}")
    public void publishFailureAlertIfNecessary() {
        int failures = failureWindow.getAndSet(0);
        if (failures >= properties.getAlerts().getAuthFailureThreshold()) {
            alertPublisher.publish(
                    AlertEvent.builder("auth-failures", AlertSeverity.WARNING)
                            .message("Authentication failures exceeded the configured threshold")
                            .putContext("failures", failures)
                            .putContext("threshold", properties.getAlerts().getAuthFailureThreshold())
                            .build()
            );
        }
    }
}
