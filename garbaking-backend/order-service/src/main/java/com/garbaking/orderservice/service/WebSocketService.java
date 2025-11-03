package com.garbaking.orderservice.service;

import com.garbaking.orderservice.dto.OrderDTO;
import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.websocket.RawOrderWebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
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
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final RawOrderWebSocketHandler rawOrderWebSocketHandler;
    private final OrderService orderService;

    // Constructor with @Lazy to break circular dependency
    public WebSocketService(SimpMessagingTemplate messagingTemplate,
                           RawOrderWebSocketHandler rawOrderWebSocketHandler,
                           @Lazy OrderService orderService) {
        this.messagingTemplate = messagingTemplate;
        this.rawOrderWebSocketHandler = rawOrderWebSocketHandler;
        this.orderService = orderService;
    }

    /**
     * Broadcast order created event to all subscribers
     */
    public void broadcastOrderCreated(OrderDTO order) {
        log.info("Broadcasting order created: {}", order.getOrderNumber());
        messagingTemplate.convertAndSend("/topic/orders/created", order);
        rawOrderWebSocketHandler.broadcast(order);
    }

    /**
     * Broadcast order updated event to all subscribers
     */
    public void broadcastOrderUpdated(OrderDTO order) {
        log.info("Broadcasting order updated: {}", order.getOrderNumber());
        messagingTemplate.convertAndSend("/topic/orders/updated", order);
        rawOrderWebSocketHandler.broadcast(order);
    }

    /**
     * Broadcast order status changed event to all subscribers
     */
    public void broadcastOrderStatusChanged(OrderDTO order) {
        log.info("Broadcasting order status changed: {} -> {}", order.getOrderNumber(), order.getStatus());
        messagingTemplate.convertAndSend("/topic/orders/status", order);
        rawOrderWebSocketHandler.broadcast(order);
    }

    /**
     * Broadcast order cancelled event to all subscribers
     */
    public void broadcastOrderCancelled(OrderDTO order) {
        log.info("Broadcasting order cancelled: {}", order.getOrderNumber());
        messagingTemplate.convertAndSend("/topic/orders/cancelled", order);
        rawOrderWebSocketHandler.broadcast(order);
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
        rawOrderWebSocketHandler.broadcast(activeOrders);
    }

    /**
     * Broadcast order update (for QR payment confirmations and other updates)
     * Accepts Order entity and converts to DTO before broadcasting
     */
    public void broadcastOrderUpdate(Order order) {
        log.info("Broadcasting order update: {} (Status: {}, Payment: {})",
                order.getOrderNumber(), order.getStatus(), order.getPaymentStatus());

        OrderDTO orderDTO = orderService.mapToDTO(order);

        // Broadcast to general order updates topic
        messagingTemplate.convertAndSend("/topic/orders/updated", orderDTO);

        // Also broadcast to payment-specific topic for QR payment confirmations
        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            messagingTemplate.convertAndSend("/topic/orders/payment", orderDTO);
        }

        // Broadcast via raw WebSocket handler
        rawOrderWebSocketHandler.broadcast(orderDTO);
    }
}
