package com.garbaking.operationsservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;

@Configuration
@EnableKafka
public class KafkaConsumerConfig {
    // Configuration is in application.yml
    // This class enables Kafka consumers for the service
}
