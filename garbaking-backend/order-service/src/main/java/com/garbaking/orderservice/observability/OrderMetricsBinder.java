package com.garbaking.orderservice.observability;

import com.garbaking.common.observability.AlertEvent;
import com.garbaking.common.observability.AlertPublisher;
import com.garbaking.common.observability.AlertSeverity;
import com.garbaking.common.observability.ObservabilityProperties;
import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.repository.OrderRepository;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.MeterBinder;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Publishes business-centric order metrics and raises alerts when operational thresholds are
 * crossed.
 */
@Component
public class OrderMetricsBinder implements MeterBinder {

    private static final List<Order.OrderStatus> BACKLOG_STATUSES = List.of(
            Order.OrderStatus.PENDING,
            Order.OrderStatus.CONFIRMED,
            Order.OrderStatus.PREPARING
    );

    private final AtomicInteger backlogOrders = new AtomicInteger();
    private final AtomicInteger pendingPayments = new AtomicInteger();
    private final OrderRepository orderRepository;
    private final ObservabilityProperties properties;
    private final AlertPublisher alertPublisher;

    public OrderMetricsBinder(
            OrderRepository orderRepository,
            ObservabilityProperties properties,
            AlertPublisher alertPublisher
    ) {
        this.orderRepository = orderRepository;
        this.properties = properties;
        this.alertPublisher = alertPublisher;
    }

    @Override
    public void bindTo(MeterRegistry registry) {
        registry.gauge("garbaking_order_backlog_total", backlogOrders);
        registry.gauge("garbaking_order_pending_payments_total", pendingPayments);
    }

    @Scheduled(fixedDelayString = "${garbaking.observability.alerts.evaluation-interval:PT5M}")
    public void refreshMetrics() {
        int backlogCount = Math.toIntExact(orderRepository.countByStatusIn(BACKLOG_STATUSES));
        int pendingPaymentCount = orderRepository.findPendingPaymentOrders().size();

        backlogOrders.set(backlogCount);
        pendingPayments.set(pendingPaymentCount);

        if (backlogCount >= properties.getAlerts().getOrderBacklogThreshold()) {
            alertPublisher.publish(
                    AlertEvent.builder("order-backlog", AlertSeverity.WARNING)
                            .message("Order backlog threshold exceeded")
                            .putContext("backlog", backlogCount)
                            .putContext("threshold", properties.getAlerts().getOrderBacklogThreshold())
                            .build()
            );
        }
    }
}
