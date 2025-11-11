package com.garbaking.operationsservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Scheduling Configuration
 *
 * Enables scheduled tasks and async processing
 */
@Configuration
@EnableScheduling
@EnableAsync
public class SchedulingConfig {
}
