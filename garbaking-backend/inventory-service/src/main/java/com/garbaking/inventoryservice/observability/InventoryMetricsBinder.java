package com.garbaking.inventoryservice.observability;

import com.garbaking.common.observability.AlertEvent;
import com.garbaking.common.observability.AlertPublisher;
import com.garbaking.common.observability.AlertSeverity;
import com.garbaking.common.observability.ObservabilityProperties;
import com.garbaking.inventoryservice.repository.MenuItemRepository;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.MeterBinder;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Reports inventory health metrics and raises alerts for low stock scenarios.
 */
@Component
public class InventoryMetricsBinder implements MeterBinder {

    private final AtomicInteger lowStockItems = new AtomicInteger();
    private final AtomicInteger outOfStockItems = new AtomicInteger();
    private final MenuItemRepository menuItemRepository;
    private final ObservabilityProperties properties;
    private final AlertPublisher alertPublisher;

    public InventoryMetricsBinder(
            MenuItemRepository menuItemRepository,
            ObservabilityProperties properties,
            AlertPublisher alertPublisher
    ) {
        this.menuItemRepository = menuItemRepository;
        this.properties = properties;
        this.alertPublisher = alertPublisher;
    }

    @Override
    public void bindTo(MeterRegistry registry) {
        registry.gauge("garbaking_inventory_low_stock_total", lowStockItems);
        registry.gauge("garbaking_inventory_out_of_stock_total", outOfStockItems);
    }

    @Scheduled(fixedDelayString = "${garbaking.observability.alerts.evaluation-interval:PT5M}")
    public void refreshMetrics() {
        int lowStockCount = menuItemRepository.findLowStockItems().size();
        int outOfStockCount = menuItemRepository.findByStockQuantityAndIsActiveTrue(0).size();

        lowStockItems.set(lowStockCount);
        outOfStockItems.set(outOfStockCount);

        if (lowStockCount >= properties.getAlerts().getLowStockThreshold()) {
            alertPublisher.publish(
                    AlertEvent.builder("low-stock", AlertSeverity.WARNING)
                            .message("Low stock items exceeded configured threshold")
                            .putContext("lowStock", lowStockCount)
                            .putContext("threshold", properties.getAlerts().getLowStockThreshold())
                            .build()
            );
        }
    }
}
