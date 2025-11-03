package com.garbaking.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway - Central entry point for all client requests
 *
 * This gateway routes requests to appropriate microservices, handles authentication,
 * rate limiting, and cross-cutting concerns like logging and monitoring.
 *
 * Routes:
 * - /api/users/** -> user-service
 * - /api/orders/** -> order-service
 * - /api/inventory/** -> inventory-service
 *
 * Gateway URL: http://localhost:8080
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}