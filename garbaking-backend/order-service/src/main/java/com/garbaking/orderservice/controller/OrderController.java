package com.garbaking.orderservice.controller;

import com.garbaking.orderservice.dto.*;
import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Order Controller
 *
 * REST endpoints for order management.
 * Routes are prefixed by API Gateway: /api/orders
 */
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    /**
     * Create new order
     * POST /orders
     */
    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody CreateOrderDTO createOrderDTO) {
        log.info("POST /orders - Creating order for user: {}", createOrderDTO.getUserId());
        OrderDTO createdOrder = orderService.createOrder(createOrderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    /**
     * Get order by ID
     * GET /orders/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or #userId == authentication.principal.id")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        log.info("GET /orders/{}", id);
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    /**
     * Get order by order number
     * GET /orders/number/{orderNumber}
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDTO> getOrderByOrderNumber(@PathVariable String orderNumber) {
        log.info("GET /orders/number/{}", orderNumber);
        OrderDTO order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    /**
     * Get all orders
     * GET /orders
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        log.info("GET /orders");
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Get orders by user ID
     * GET /orders/user/{userId}
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or #userId == authentication.principal.id")
    public ResponseEntity<List<OrderDTO>> getOrdersByUserId(@PathVariable Long userId) {
        log.info("GET /orders/user/{}", userId);
        List<OrderDTO> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get my orders (current user)
     * GET /orders/my
     */
    @GetMapping("/my")
    public ResponseEntity<List<OrderDTO>> getMyOrders(
            @RequestHeader("X-User-Id") Long userId
    ) {
        log.info("GET /orders/my for user: {}", userId);
        List<OrderDTO> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get orders by status
     * GET /orders/status/{status}
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(@PathVariable Order.OrderStatus status) {
        log.info("GET /orders/status/{}", status);
        List<OrderDTO> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get active orders
     * GET /orders/active
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<OrderDTO>> getActiveOrders() {
        log.info("GET /orders/active");
        List<OrderDTO> orders = orderService.getActiveOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Get today's orders
     * GET /orders/today
     */
    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<OrderDTO>> getTodaysOrders() {
        log.info("GET /orders/today");
        List<OrderDTO> orders = orderService.getTodaysOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Update order status
     * PUT /orders/{id}/status
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusDTO statusDTO
    ) {
        log.info("PUT /orders/{}/status - New status: {}", id, statusDTO.getStatus());
        OrderDTO updatedOrder = orderService.updateOrderStatus(id, statusDTO);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * Update payment status
     * PUT /orders/{id}/payment
     */
    @PutMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderDTO> updatePaymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePaymentDTO paymentDTO
    ) {
        log.info("PUT /orders/{}/payment - New payment status: {}", id, paymentDTO.getPaymentStatus());
        OrderDTO updatedOrder = orderService.updatePaymentStatus(id, paymentDTO);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * Cancel order
     * POST /orders/{id}/cancel
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or @orderService.getOrderById(#id).userId == authentication.principal.id")
    public ResponseEntity<OrderDTO> cancelOrder(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {
        log.info("POST /orders/{}/cancel", id);
        OrderDTO cancelledOrder = orderService.cancelOrder(id, reason);
        return ResponseEntity.ok(cancelledOrder);
    }

    /**
     * Delete order (soft delete)
     * DELETE /orders/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        log.info("DELETE /orders/{}", id);
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Hard delete order (admin only)
     * DELETE /orders/{id}/hard
     */
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> hardDeleteOrder(@PathVariable Long id) {
        log.info("DELETE /orders/{}/hard", id);
        orderService.hardDeleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
