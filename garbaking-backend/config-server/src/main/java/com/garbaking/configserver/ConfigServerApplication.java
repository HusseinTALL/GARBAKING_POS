package com.garbaking.configserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

/**
 * Config Server - Centralized configuration management for all microservices
 *
 * This server provides external configuration for all services in the system.
 * Configuration files are stored in the /config directory and served via REST API.
 *
 * Access configuration: http://localhost:8888/{service-name}/{profile}
 * Example: http://localhost:8888/user-service/default
 */
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
