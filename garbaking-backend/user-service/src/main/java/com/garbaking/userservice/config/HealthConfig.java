package com.garbaking.userservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Custom health indicators for user-service
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
}
