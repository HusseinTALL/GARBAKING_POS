package com.garbaking.operationsservice.listener;

import com.garbaking.operationsservice.dto.order.OrderEventDTO;
import com.garbaking.operationsservice.model.CashDrawerSession;
import com.garbaking.operationsservice.model.SessionStatus;
import com.garbaking.operationsservice.repository.CashDrawerSessionRepository;
import com.garbaking.operationsservice.service.CashDrawerService;
import com.garbaking.operationsservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Kafka Event Listener for Order Payment Events
 * 
 * Listens to order.payment.updated events from order-service and automatically
 * records cash transactions when orders are paid with CASH payment method.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderPaymentEventListener {

    private final CashDrawerService cashDrawerService;
    private final PaymentService paymentService;
    private final CashDrawerSessionRepository sessionRepository;

    @KafkaListener(topics = "order.payment.updated", groupId = "operations-service-group")
    public void handleOrderPaymentEvent(OrderEventDTO order) {
        try {
            log.info("Received order payment event: orderNumber={}, paymentStatus={}, paymentMethod={}, amount={}",
                    order.getOrderNumber(), order.getPaymentStatus(), order.getPaymentMethod(), order.getTotalAmount());

            // Only process PAID orders
            if (!"PAID".equals(order.getPaymentStatus())) {
                log.debug("Ignoring non-PAID order: {} status={}", order.getOrderNumber(), order.getPaymentStatus());
                return;
            }

            // Handle CASH payments - automatically record cash transaction
            if ("CASH".equals(order.getPaymentMethod())) {
                handleCashPayment(order);
            }

            // TODO: Future card payment handling
            // if ("CARD".equals(order.getPaymentMethod())) {
            //     handleCardPayment(order);
            // }

            log.info("Successfully processed payment event for order: {}", order.getOrderNumber());

        } catch (Exception e) {
            log.error("Error processing order payment event for order: {}", order.getOrderNumber(), e);
            // Note: Kafka will retry based on configuration
            // Consider implementing dead letter queue for failed events
        }
    }

    /**
     * Handle cash payment by recording transaction in active cash drawer session
     */
    private void handleCashPayment(OrderEventDTO order) {
        log.info("Processing cash payment for order: {} amount: {}", order.getOrderNumber(), order.getTotalAmount());

        // Find active cash drawer session for the user who confirmed payment
        Long userId = order.getQrConfirmedByUserId() != null ? order.getQrConfirmedByUserId() : order.getUserId();
        
        if (userId == null) {
            log.warn("No user ID found for order {}, cannot determine cash drawer session", order.getOrderNumber());
            return;
        }

        // Try to find an open session for this user
        Optional<CashDrawerSession> sessionOpt = findActiveSessionForUser(userId);

        if (sessionOpt.isEmpty()) {
            log.warn("No active cash drawer session found for user: {} order: {}. Cash transaction not recorded automatically.",
                    userId, order.getOrderNumber());
            log.warn("Cash will need to be reconciled manually at end of shift.");
            return;
        }

        CashDrawerSession session = sessionOpt.get();

        try {
            // Record cash sale transaction
            cashDrawerService.recordCashSale(
                    session.getId(),
                    order.getTotalAmount(),
                    order.getOrderNumber(), // Use order number as reference
                    userId
            );

            log.info("Recorded cash sale transaction: session={} order={} amount={}",
                    session.getId(), order.getOrderNumber(), order.getTotalAmount());

        } catch (Exception e) {
            log.error("Failed to record cash transaction for order: {}", order.getOrderNumber(), e);
            throw e; // Rethrow to trigger Kafka retry
        }
    }

    /**
     * Find active cash drawer session for a user
     * Tries to find any open session (could be enhanced with device/terminal matching)
     */
    private Optional<CashDrawerSession> findActiveSessionForUser(Long userId) {
        // Find all sessions for user and get the most recent open one
        return sessionRepository.findByUserId(userId).stream()
                .filter(session -> session.getStatus() == SessionStatus.OPEN)
                .max((s1, s2) -> s1.getOpenedAt().compareTo(s2.getOpenedAt()));
    }

    // Additional event listeners can be added here

    @KafkaListener(topics = "order.created", groupId = "operations-service-group")
    public void handleOrderCreatedEvent(OrderEventDTO order) {
        log.debug("Order created: {} type: {} amount: {}",
                order.getOrderNumber(), order.getOrderType(), order.getTotalAmount());
        
        // Future: Could trigger receipt pre-generation, kitchen notifications, etc.
    }

    @KafkaListener(topics = "order.status.changed", groupId = "operations-service-group")
    public void handleOrderStatusChangedEvent(OrderEventDTO order) {
        log.debug("Order status changed: {} status: {} → {}",
                order.getOrderNumber(), order.getStatus(), order.getStatus());
        
        // Future: Could trigger kitchen display updates, notification system, etc.
    }

    @KafkaListener(topics = "order.cancelled", groupId = "operations-service-group")
    public void handleOrderCancelledEvent(OrderEventDTO order) {
        log.info("Order cancelled: {} reason: {}", order.getOrderNumber(), order.getCancellationReason());
        
        // Future: If order was already paid, could trigger refund workflow
        if ("PAID".equals(order.getPaymentStatus())) {
            log.warn("Cancelled order was already paid: {} - refund may be required", order.getOrderNumber());
            // TODO: Implement automatic refund initiation
        }
    }
}
