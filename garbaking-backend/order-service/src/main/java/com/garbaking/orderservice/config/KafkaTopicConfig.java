package com.garbaking.orderservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Value("${spring.kafka.topics.order-created:order.created}")
    private String orderCreatedTopicName;

    @Value("${spring.kafka.topics.order-status:order.status.changed}")
    private String orderStatusTopicName;

    @Value("${spring.kafka.topics.order-payment:order.payment.updated}")
    private String orderPaymentTopicName;

    @Value("${spring.kafka.topics.order-cancelled:order.cancelled}")
    private String orderCancelledTopicName;

    @Bean
    public NewTopic orderCreatedTopic() {
        return TopicBuilder.name(orderCreatedTopicName).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic orderStatusTopic() {
        return TopicBuilder.name(orderStatusTopicName).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic orderPaymentTopic() {
        return TopicBuilder.name(orderPaymentTopicName).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic orderCancelledTopic() {
        return TopicBuilder.name(orderCancelledTopicName).partitions(3).replicas(1).build();
    }
}
