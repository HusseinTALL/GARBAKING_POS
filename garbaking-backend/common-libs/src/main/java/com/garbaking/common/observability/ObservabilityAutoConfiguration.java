package com.garbaking.common.observability;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

/**
 * Auto-configuration that wires shared observability beans into every service that depends on the
 * {@code common-libs} module.
 */
@AutoConfiguration
@EnableConfigurationProperties(ObservabilityProperties.class)
public class ObservabilityAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    MeterRegistryCustomizer<MeterRegistry> commonTagsCustomizer(ObservabilityProperties properties, Environment environment) {
        return registry -> registry.config().commonTags(
                "service", environment.getProperty("spring.application.name", "unknown"),
                "environment", properties.getEnvironment()
        );
    }

    @Bean
    @ConditionalOnMissingBean(AlertPublisher.class)
    AlertPublisher alertPublisher(Environment environment) {
        String serviceName = environment.getProperty("spring.application.name", "unknown");
        return new LoggingAlertPublisher(serviceName);
    }
}