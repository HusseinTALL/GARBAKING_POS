package com.garbaking.inventoryservice.config;

import com.garbaking.inventoryservice.service.InventoryEventPublisher;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic inventoryMenuItemLifecycleTopic() {
        return TopicBuilder.name(InventoryEventPublisher.TOPIC_MENU_ITEM_LIFECYCLE)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic inventoryStockAdjustedTopic() {
        return TopicBuilder.name(InventoryEventPublisher.TOPIC_STOCK_ADJUSTED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic inventoryAuditTopic() {
        return TopicBuilder.name(InventoryEventPublisher.TOPIC_INVENTORY_AUDIT)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic inventoryStockRequestsTopic() {
        return TopicBuilder.name("inventory.stock.requests")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
