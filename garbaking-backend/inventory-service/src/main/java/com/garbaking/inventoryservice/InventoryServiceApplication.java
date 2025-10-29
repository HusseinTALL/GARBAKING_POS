package com.garbaking.inventoryservice;

import com.garbaking.inventoryservice.config.ImageStorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Inventory Service Application
 *
 * Manages menu items, categories, and inventory for the Garbaking POS system.
 *
 * Features:
 * - Menu item management (CRUD operations)
 * - Category management
 * - Image upload and storage
 * - Stock tracking and availability
 * - Price management
 * - Integration with Eureka for service discovery
 * - Kafka event publishing for inventory changes
 * - JPA auditing for created/updated timestamps
 *
 * @author Garbaking Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaAuditing
@EnableKafka
@EnableConfigurationProperties(ImageStorageProperties.class)
@EnableScheduling
public class InventoryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventoryServiceApplication.class, args);
    }
}
