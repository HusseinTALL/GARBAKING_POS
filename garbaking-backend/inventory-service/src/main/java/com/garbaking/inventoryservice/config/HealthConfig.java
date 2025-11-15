package com.garbaking.inventoryservice.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.DescribeClusterResult;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaAdmin;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.concurrent.TimeUnit;

/**
 * Custom health indicators for inventory-service
 */
@Configuration
@Slf4j
public class HealthConfig {

    /**
     * Database connectivity health indicator
     * Checks if the database connection is available and responsive
     */
    @Bean
    public HealthIndicator databaseHealthIndicator(DataSource dataSource) {
        return () -> {
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(2)) {  // 2 second timeout
                    return Health.up()
                            .withDetail("database", "MySQL")
                            .withDetail("status", "Connection successful")
                            .build();
                } else {
                    return Health.down()
                            .withDetail("database", "MySQL")
                            .withDetail("status", "Connection invalid")
                            .build();
                }
            } catch (SQLException e) {
                log.error("Database health check failed", e);
                return Health.down()
                        .withDetail("database", "MySQL")
                        .withDetail("error", e.getMessage())
                        .build();
            }
        };
    }

    /**
     * Kafka connectivity health indicator
     * Checks if Kafka broker is available and responsive
     */
    @Bean
    public HealthIndicator kafkaHealthIndicator(KafkaAdmin kafkaAdmin) {
        return () -> {
            try (AdminClient adminClient = AdminClient.create(kafkaAdmin.getConfigurationProperties())) {
                DescribeClusterResult clusterResult = adminClient.describeCluster();
                int nodeCount = clusterResult.nodes().get(5, TimeUnit.SECONDS).size();

                return Health.up()
                        .withDetail("kafka", "Broker")
                        .withDetail("status", "Connected")
                        .withDetail("nodes", nodeCount)
                        .build();
            } catch (Exception e) {
                log.error("Kafka health check failed", e);
                return Health.down()
                        .withDetail("kafka", "Broker")
                        .withDetail("error", e.getMessage())
                        .build();
            }
        };
    }
}
