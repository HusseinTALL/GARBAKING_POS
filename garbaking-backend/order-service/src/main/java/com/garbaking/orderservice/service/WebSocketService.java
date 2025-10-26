package com.garbaking.orderservice.service;

import com.garbaking.orderservice.dto.OrderDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * WebSocket Service
 *
 * Handles real-time messaging via WebSocket/STOMP.
 * Broadcasts order updates to subscribed clients.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast order created event to all subscribers
     */
    public void broadcastOrderCreated(OrderDTO order) {
        log.info("Broadcasting order created: {}", order.getOrderNumber());
        messagingTemplate.convertAndSend("/topic/orders/created", order);
    }

    /**
     * Broadcast order updated event to all subscribers
     */
    public void broadcastOrderUpdated(OrderDTO order) {
        log.info("Broadcasting order updated: {}", order.getOrderNumber());
        messagingTemplate.convertAndSend("/topic/orders/updated", order);
    }

    /**
     * Broadcast order status changed event to all subscribers
     */
    public void broadcastOrderStatusChanged(OrderDTO order) {
        log.info("Broadcasting order status changed: {} -> {}", order.getOrderNumber(), order.getStatus());
        messagingTemplate.convertAndSend("/topic/orders/status", order);
    }

    /**
     * Broadcast order cancelled event to all subscribers
     */
    public void broadcastOrderCancelled(OrderDTO order) {
        log.info("Broadcasting order cancelled: {}", order.getOrderNumber());
        messagingTemplate.convertAndSend("/topic/orders/cancelled", order);
    }

    /**
     * Send order update to specific user
     */
    public void sendOrderToUser(Long userId, OrderDTO order) {
        log.info("Sending order to user {}: {}", userId, order.getOrderNumber());
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/orders",
                order
        );
    }

    /**
     * Broadcast all active orders (for kitchen display, admin dashboard)
     */
    public void broadcastActiveOrdersUpdate(Object activeOrders) {
        log.info("Broadcasting active orders update");
        messagingTemplate.convertAndSend("/topic/orders/active", activeOrders);
    }
}
