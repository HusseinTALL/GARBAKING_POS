package com.garbaking.orderservice.service;

import com.garbaking.orderservice.dto.analytics.DashboardAnalytics;
import com.garbaking.orderservice.dto.analytics.MenuPerformanceResponse;
import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.model.OrderItem;
import com.garbaking.orderservice.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private Clock fixedClock;
    private Order todayOrder;
    private Order yesterdayOrder;

    @BeforeEach
    void setUp() {
        fixedClock = Clock.fixed(Instant.parse("2024-01-15T10:00:00Z"), ZoneOffset.UTC);
        analyticsService = new AnalyticsService(orderRepository, fixedClock);

        todayOrder = buildOrder("ORD-TODAY", LocalDateTime.of(2024, 1, 15, 9, 0), Order.OrderStatus.CONFIRMED);
        yesterdayOrder = buildOrder("ORD-YDAY", LocalDateTime.of(2024, 1, 14, 11, 0), Order.OrderStatus.COMPLETED);

        when(orderRepository.findByCreatedAtBetweenWithItems(ArgumentMatchers.any(), ArgumentMatchers.any())).thenAnswer(invocation -> {
            LocalDateTime start = invocation.getArgument(0);
            LocalDateTime end = invocation.getArgument(1);
            LocalDate startDate = start.toLocalDate();
            if (startDate.equals(LocalDate.of(2024, 1, 15))) {
                return List.of(todayOrder);
            }
            if (startDate.equals(LocalDate.of(2024, 1, 14))) {
                return List.of(yesterdayOrder);
            }
            return List.of();
        });

        when(orderRepository.findByStatusIn(ArgumentMatchers.any())).thenReturn(List.of(todayOrder));
        when(orderRepository.countByStatus(Order.OrderStatus.PENDING)).thenReturn(0L);
        when(orderRepository.countByStatus(Order.OrderStatus.PREPARING)).thenReturn(0L);
        when(orderRepository.countByStatus(Order.OrderStatus.READY)).thenReturn(0L);
    }

    @Test
    void getDashboardAnalyticsAggregatesTodaysOrders() {
        DashboardAnalytics analytics = analyticsService.getDashboardAnalytics();

        assertThat(analytics.today().orders()).isEqualTo(1);
        assertThat(analytics.today().revenue()).isEqualByComparingTo(BigDecimal.valueOf(4500));
        assertThat(analytics.topMenuItems()).hasSize(1);
        assertThat(analytics.orders().activeOrders()).isEqualTo(1);
    }

    @Test
    void getMenuPerformanceReturnsAggregatedItems() {
        when(orderRepository.findByCreatedAtBetweenWithItems(ArgumentMatchers.any(), ArgumentMatchers.any()))
                .thenReturn(List.of(todayOrder));

        MenuPerformanceResponse response = analyticsService.getMenuPerformance(7);

        assertThat(response.menuItems()).hasSize(1);
        assertThat(response.menuItems().get(0).quantitySold()).isEqualTo(3);
        assertThat(response.totalOrders()).isEqualTo(1);
    }

    private Order buildOrder(String number, LocalDateTime createdAt, Order.OrderStatus status) {
        Order order = Order.builder()
                .orderNumber(number)
                .status(status)
                .orderType(Order.OrderType.DINE_IN)
                .userId(1L)
                .subtotal(BigDecimal.valueOf(4000))
                .taxAmount(BigDecimal.valueOf(250))
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.valueOf(4500))
                .paymentStatus(Order.PaymentStatus.PAID)
                .paymentMethod(Order.PaymentMethod.CARD)
                .createdAt(createdAt)
                .updatedAt(createdAt)
                .build();

        OrderItem item = OrderItem.builder()
                .menuItemId(100L)
                .menuItemName("Jollof Rice")
                .menuItemSku("MEAL-001")
                .quantity(3)
                .unitPrice(BigDecimal.valueOf(1500))
                .subtotal(BigDecimal.valueOf(4500))
                .build();
        item.setOrder(order);

        List<OrderItem> items = new ArrayList<>();
        items.add(item);
        order.setItems(items);
        return order;
    }
}
