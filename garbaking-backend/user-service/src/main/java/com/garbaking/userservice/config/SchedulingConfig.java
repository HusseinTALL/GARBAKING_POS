package com.garbaking.userservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Scheduling Configuration
 *
 * Enables Spring's scheduled task execution capability.
 * Used for background jobs like token cleanup, session monitoring, etc.
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
    // Spring will automatically detect @Scheduled methods
}
