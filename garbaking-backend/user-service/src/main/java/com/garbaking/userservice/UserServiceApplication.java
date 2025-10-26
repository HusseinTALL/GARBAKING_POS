package com.garbaking.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.kafka.annotation.EnableKafka;

/**
 * User Service - Handles user management and authentication
 *
 * Features:
 * - User registration and login
 * - JWT token generation and validation
 * - User profile management
 * - Role-based access control
 * - Publishes user events to Kafka
 *
 * Endpoints:
 * - POST /auth/register - Register new user
 * - POST /auth/login - Authenticate user
 * - GET /users/{id} - Get user by ID
 * - PUT /users/{id} - Update user
 * - DELETE /users/{id} - Delete user
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaAuditing
@EnableKafka
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
