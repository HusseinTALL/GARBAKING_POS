package com.garbaking.orderservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Order Service Application
 *
 * Manages orders, order items, and order processing for the Garbaking POS system.
 *
 * Features:
 * - Order creation and management (CRUD operations)
 * - Order item tracking
 * - Order status management (PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED)
 * - Payment processing and tracking
 * - Customer order history
 * - Staff order management
 * - Integration with Eureka for service discovery
 * - Kafka event publishing for order lifecycle events
 * - Kafka consumption of inventory and user events
 * - JPA auditing for created/updated timestamps
 *
 * @author Garbaking Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaAuditing
@EnableKafka
@EnableScheduling
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
