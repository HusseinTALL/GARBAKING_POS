package com.garbaking.common.observability;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Shared configuration properties for observability features across Garbaking microservices.
 */
@ConfigurationProperties("garbaking.observability")
public class ObservabilityProperties {

    private String environment = "local";
    private final Alerts alerts = new Alerts();

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public Alerts getAlerts() {
        return alerts;
    }

    /**
     * Alerting configuration that controls thresholds for emitting warnings.
     */
    public static class Alerts {

        private int authFailureThreshold = 15;
        private int orderBacklogThreshold = 20;
        private int lowStockThreshold = 10;
        private Duration evaluationInterval = Duration.ofMinutes(5);

        public int getAuthFailureThreshold() {
            return authFailureThreshold;
        }

        public void setAuthFailureThreshold(int authFailureThreshold) {
            this.authFailureThreshold = authFailureThreshold;
        }

        public int getOrderBacklogThreshold() {
            return orderBacklogThreshold;
        }

        public void setOrderBacklogThreshold(int orderBacklogThreshold) {
            this.orderBacklogThreshold = orderBacklogThreshold;
        }

        public int getLowStockThreshold() {
            return lowStockThreshold;
        }

        public void setLowStockThreshold(int lowStockThreshold) {
            this.lowStockThreshold = lowStockThreshold;
        }

        public Duration getEvaluationInterval() {
            return evaluationInterval;
        }

        public void setEvaluationInterval(Duration evaluationInterval) {
            this.evaluationInterval = evaluationInterval;
        }
    }
}
