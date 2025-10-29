package com.garbaking.orderservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class KafkaOrderEventListener {

    @KafkaListener(topics = {
            "order.created",
            "order.status.changed",
            "order.payment.updated",
            "order.cancelled"
    }, groupId = "order-service-monitor")
    public void onOrderEvent(String payload) {
        log.debug("Received order event from Kafka: {}", payload);
    }
}
