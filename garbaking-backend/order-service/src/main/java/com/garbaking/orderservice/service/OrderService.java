package com.garbaking.orderservice.service;

import com.garbaking.orderservice.dto.*;
import com.garbaking.orderservice.exception.InvalidOrderStateException;
import com.garbaking.orderservice.exception.ResourceNotFoundException;
import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.model.OrderItem;
import com.garbaking.orderservice.repository.OrderItemRepository;
import com.garbaking.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Order Service
 *
 * Business logic for order management.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final AtomicLong orderCounter = new AtomicLong(0);

    /**
     * Create a new order
     */
    @Transactional
    public OrderDTO createOrder(CreateOrderDTO createOrderDTO) {
        log.info("Creating new order for user: {}", createOrderDTO.getUserId());

        // Generate unique order number
        String orderNumber = generateOrderNumber();

        // Create order entity
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .status(Order.OrderStatus.PENDING)
                .orderType(createOrderDTO.getOrderType())
                .userId(createOrderDTO.getUserId())
                .customerName(createOrderDTO.getCustomerName())
                .customerPhone(createOrderDTO.getCustomerPhone())
                .customerEmail(createOrderDTO.getCustomerEmail())
                .taxAmount(createOrderDTO.getTaxAmount() != null ? createOrderDTO.getTaxAmount() : BigDecimal.ZERO)
                .discountAmount(createOrderDTO.getDiscountAmount() != null ? createOrderDTO.getDiscountAmount() : BigDecimal.ZERO)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .paymentMethod(createOrderDTO.getPaymentMethod())
                .deliveryAddress(createOrderDTO.getDeliveryAddress())
                .deliveryInstructions(createOrderDTO.getDeliveryInstructions())
                .deliveryFee(createOrderDTO.getDeliveryFee())
                .notes(createOrderDTO.getNotes())
                .tableNumber(createOrderDTO.getTableNumber())
                .scheduledFor(createOrderDTO.getScheduledFor())
                .build();

        // Add order items
        for (OrderItemDTO itemDTO : createOrderDTO.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .menuItemId(itemDTO.getMenuItemId())
                    .menuItemName(itemDTO.getMenuItemName())
                    .menuItemSku(itemDTO.getMenuItemSku())
                    .quantity(itemDTO.getQuantity())
                    .unitPrice(itemDTO.getUnitPrice())
                    .specialInstructions(itemDTO.getSpecialInstructions())
                    .status(OrderItem.ItemStatus.PENDING)
                    .build();

            orderItem.calculateSubtotal();
            order.addItem(orderItem);
        }

        // Calculate totals
        order.calculateTotals();

        // Save order
        Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully: {}", savedOrder.getOrderNumber());

        // Publish order.created event
        publishOrderEvent("order.created", savedOrder);

        return convertToDTO(savedOrder);
    }

    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        log.info("Fetching order with ID: {}", id);
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return convertToDTO(order);
    }

    /**
     * Get order by order number
     */
    @Transactional(readOnly = true)
    public OrderDTO getOrderByOrderNumber(String orderNumber) {
        log.info("Fetching order with number: {}", orderNumber);
        Order order = orderRepository.findByOrderNumberWithItems(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        return convertToDTO(order);
    }

    /**
     * Get all orders
     */
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by user ID
     */
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUserId(Long userId) {
        log.info("Fetching orders for user: {}", userId);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by status
     */
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByStatus(Order.OrderStatus status) {
        log.info("Fetching orders with status: {}", status);
        return orderRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get active orders
     */
    @Transactional(readOnly = true)
    public List<OrderDTO> getActiveOrders() {
        log.info("Fetching active orders");
        return orderRepository.findActiveOrders().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get today's orders
     */
    @Transactional(readOnly = true)
    public List<OrderDTO> getTodaysOrders() {
        log.info("Fetching today's orders");
        return orderRepository.findTodaysOrders().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update order status
     */
    @Transactional
    public OrderDTO updateOrderStatus(Long id, UpdateOrderStatusDTO statusDTO) {
        log.info("Updating order {} status to: {}", id, statusDTO.getStatus());

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // Validate status transition
        validateStatusTransition(order, statusDTO.getStatus());

        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(statusDTO.getStatus());

        // Update timestamps based on status
        switch (statusDTO.getStatus()) {
            case CONFIRMED:
                order.setConfirmedAt(LocalDateTime.now());
                break;
            case COMPLETED:
                order.setCompletedAt(LocalDateTime.now());
                break;
            case CANCELLED:
                order.setCancelledAt(LocalDateTime.now());
                order.setCancellationReason(statusDTO.getReason());
                break;
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order status updated from {} to {}", oldStatus, statusDTO.getStatus());

        // Publish status change event
        publishOrderEvent("order.status.changed", updatedOrder);

        return convertToDTO(updatedOrder);
    }

    /**
     * Update payment status
     */
    @Transactional
    public OrderDTO updatePaymentStatus(Long id, UpdatePaymentDTO paymentDTO) {
        log.info("Updating order {} payment status to: {}", id, paymentDTO.getPaymentStatus());

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        order.setPaymentStatus(paymentDTO.getPaymentStatus());
        order.setTransactionId(paymentDTO.getTransactionId());

        if (paymentDTO.getPaymentMethod() != null) {
            order.setPaymentMethod(paymentDTO.getPaymentMethod());
        }

        if (paymentDTO.getPaymentStatus() == Order.PaymentStatus.PAID) {
            order.setPaidAt(LocalDateTime.now());
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order payment status updated successfully");

        // Publish payment event
        publishOrderEvent("order.payment.updated", updatedOrder);

        return convertToDTO(updatedOrder);
    }

    /**
     * Cancel order
     */
    @Transactional
    public OrderDTO cancelOrder(Long id, String reason) {
        log.info("Cancelling order: {}", id);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (!order.canBeCancelled()) {
            throw new InvalidOrderStateException(
                    "Order cannot be cancelled in " + order.getStatus() + " status"
            );
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason(reason);

        Order cancelledOrder = orderRepository.save(order);
        log.info("Order cancelled successfully");

        // Publish cancellation event
        publishOrderEvent("order.cancelled", cancelledOrder);

        return convertToDTO(cancelledOrder);
    }

    /**
     * Delete order (soft delete by cancelling)
     */
    @Transactional
    public void deleteOrder(Long id) {
        log.info("Deleting order: {}", id);
        cancelOrder(id, "Order deleted");
    }

    /**
     * Hard delete order (admin only)
     */
    @Transactional
    public void hardDeleteOrder(Long id) {
        log.info("Hard deleting order: {}", id);

        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order not found with id: " + id);
        }

        orderRepository.deleteById(id);
        log.info("Order hard deleted successfully");
    }

    /**
     * Generate unique order number
     */
    private String generateOrderNumber() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String datePart = now.format(formatter);
        long counter = orderCounter.incrementAndGet();
        return String.format("ORD-%s-%04d", datePart, counter % 10000);
    }

    /**
     * Validate status transition
     */
    private void validateStatusTransition(Order order, Order.OrderStatus newStatus) {
        Order.OrderStatus currentStatus = order.getStatus();

        // Can't change from terminal states
        if (currentStatus == Order.OrderStatus.COMPLETED || currentStatus == Order.OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException(
                    "Cannot change status from " + currentStatus
            );
        }

        // Specific validations can be added here
    }

    /**
     * Convert Order entity to OrderDTO
     */
    private OrderDTO convertToDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .orderType(order.getOrderType())
                .userId(order.getUserId())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerEmail(order.getCustomerEmail())
                .items(order.getItems().stream()
                        .map(this::convertItemToDTO)
                        .collect(Collectors.toList()))
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .transactionId(order.getTransactionId())
                .paidAt(order.getPaidAt())
                .deliveryAddress(order.getDeliveryAddress())
                .deliveryInstructions(order.getDeliveryInstructions())
                .deliveryFee(order.getDeliveryFee())
                .notes(order.getNotes())
                .tableNumber(order.getTableNumber())
                .estimatedPreparationTime(order.getEstimatedPreparationTime())
                .scheduledFor(order.getScheduledFor())
                .confirmedAt(order.getConfirmedAt())
                .completedAt(order.getCompletedAt())
                .cancelledAt(order.getCancelledAt())
                .cancellationReason(order.getCancellationReason())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * Convert OrderItem entity to OrderItemDTO
     */
    private OrderItemDTO convertItemToDTO(OrderItem item) {
        return OrderItemDTO.builder()
                .id(item.getId())
                .orderId(item.getOrderId())
                .menuItemId(item.getMenuItemId())
                .menuItemName(item.getMenuItemName())
                .menuItemSku(item.getMenuItemSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .specialInstructions(item.getSpecialInstructions())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .build();
    }

    /**
     * Publish order events to Kafka
     */
    private void publishOrderEvent(String topic, Order order) {
        try {
            OrderDTO orderDTO = convertToDTO(order);
            kafkaTemplate.send(topic, order.getId().toString(), orderDTO);
            log.info("Published event to topic {}: {}", topic, order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to publish event to topic {}: {}", topic, e.getMessage());
            // Don't throw exception - event publishing shouldn't fail the main operation
        }
    }
}
