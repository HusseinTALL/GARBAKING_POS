package com.garbaking.orderservice.controller;

import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics Controller
 * Provides analytics and reporting endpoints for orders and sales data
 */
@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Get dashboard statistics
     * Returns key metrics for the dashboard
     */
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();

        // Get all orders for today
        List<Order> todaysOrders = orderRepository.findByCreatedAtAfter(startOfDay);

        // Get all active orders (not completed, cancelled, or failed)
        List<Order> activeOrders = orderRepository.findByStatusInOrderByCreatedAtDesc(
            Arrays.asList(
                Order.OrderStatus.PENDING,
                Order.OrderStatus.CONFIRMED,
                Order.OrderStatus.PREPARING,
                Order.OrderStatus.READY
            )
        );

        // Calculate today's revenue
        BigDecimal todaysRevenue = todaysOrders.stream()
            .filter(o -> o.getTotalAmount() != null)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Count completed orders today
        long completedToday = todaysOrders.stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
            .count();

        // Calculate average order value
        double averageOrderValue = todaysOrders.isEmpty() ? 0.0 :
            todaysRevenue.doubleValue() / todaysOrders.size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("todaysOrders", todaysOrders.size());
        stats.put("activeOrders", activeOrders.size());
        stats.put("todaysRevenue", todaysRevenue);
        stats.put("completedOrders", completedToday);
        stats.put("averageOrderValue", averageOrderValue);
        stats.put("pendingOrders", activeOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.PENDING).count());
        stats.put("preparingOrders", activeOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.PREPARING).count());

        return stats;
    }

    /**
     * Get menu performance analytics
     * Shows which menu items are selling best
     */
    @GetMapping("/menu-performance")
    public Map<String, Object> getMenuPerformance(@RequestParam(defaultValue = "30") int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Order> orders = orderRepository.findByCreatedAtAfter(startDate);

        // Aggregate menu item sales
        Map<String, Integer> itemSales = new HashMap<>();
        Map<String, BigDecimal> itemRevenue = new HashMap<>();

        for (Order order : orders) {
            if (order.getItems() == null) {
                continue;
            }
            for (var item : order.getItems()) {
                String itemName = Optional.ofNullable(item.getMenuItemName()).orElse("Unknown Item");
                int quantity = item.getQuantity();
                BigDecimal unitPrice = Optional.ofNullable(item.getUnitPrice()).orElse(BigDecimal.ZERO);
                BigDecimal revenue = unitPrice.multiply(BigDecimal.valueOf(quantity));

                itemSales.merge(itemName, quantity, Integer::sum);
                itemRevenue.merge(itemName, revenue, BigDecimal::add);
            }
        }

        // Sort by sales quantity
        List<Map<String, Object>> topItems = itemSales.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(10)
            .map(entry -> {
                Map<String, Object> item = new HashMap<>();
                item.put("name", entry.getKey());
                item.put("quantity", entry.getValue());
                item.put("revenue", itemRevenue.get(entry.getKey()));
                return item;
            })
            .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("period", days + " days");
        result.put("topItems", topItems);
        result.put("totalOrders", orders.size());

        return result;
    }

    /**
     * Get customer insights
     * Provides analytics about customer behavior
     */
    @GetMapping("/customer-insights")
    public Map<String, Object> getCustomerInsights(@RequestParam(defaultValue = "30") int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Order> orders = orderRepository.findByCreatedAtAfter(startDate);

        // Calculate metrics
        Map<String, Long> ordersByType = orders.stream()
            .collect(Collectors.groupingBy(
                order -> order.getOrderType() != null ? order.getOrderType().name() : "UNKNOWN",
                Collectors.counting()
            ));

        Map<String, Long> ordersByStatus = orders.stream()
            .filter(o -> o.getStatus() != null)
            .collect(Collectors.groupingBy(order -> order.getStatus().name(), Collectors.counting()));

        // Calculate average order value
        double averageOrderValue = orders.isEmpty() ? 0.0 :
            orders.stream()
                .filter(o -> o.getTotalAmount() != null)
                .map(Order::getTotalAmount)
                .map(BigDecimal::doubleValue)
                .reduce(0.0, Double::sum) / orders.size();

        // Peak hours analysis
        Map<Integer, Long> ordersByHour = orders.stream()
            .filter(order -> order.getCreatedAt() != null)
            .collect(Collectors.groupingBy(
                order -> order.getCreatedAt().getHour(),
                Collectors.counting()
            ));

        Map<String, Object> result = new HashMap<>();
        result.put("period", days + " days");
        result.put("totalOrders", orders.size());
        result.put("averageOrderValue", averageOrderValue);
        result.put("ordersByType", ordersByType);
        result.put("ordersByStatus", ordersByStatus);
        result.put("peakHours", ordersByHour.entrySet().stream()
            .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
            .limit(5)
            .collect(Collectors.toList()));

        return result;
    }

    /**
     * Get sales data for a date range
     */
    @GetMapping("/sales")
    public Map<String, Object> getSalesData(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        LocalDateTime start = startDate != null ?
            LocalDate.parse(startDate).atStartOfDay() :
            LocalDateTime.now().minusDays(30);

        LocalDateTime end = endDate != null ?
            LocalDate.parse(endDate).atTime(23, 59, 59) :
            LocalDateTime.now();

        List<Order> orders = orderRepository.findByCreatedAtBetween(start, end);

        BigDecimal totalRevenue = orders.stream()
            .filter(o -> o.getTotalAmount() != null)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new HashMap<>();
        result.put("startDate", start);
        result.put("endDate", end);
        result.put("totalOrders", orders.size());
        result.put("totalRevenue", totalRevenue);
        result.put("averageOrderValue", orders.isEmpty() ? 0.0 : totalRevenue.doubleValue() / orders.size());

        return result;
    }

    /**
     * Get peak hours analytics
     */
    @GetMapping("/peak-hours")
    public Map<String, Object> getPeakHours(@RequestParam(defaultValue = "7") int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Order> orders = orderRepository.findByCreatedAtAfter(startDate);

        Map<Integer, Long> ordersByHour = orders.stream()
            .filter(order -> order.getCreatedAt() != null)
            .collect(Collectors.groupingBy(
                order -> order.getCreatedAt().getHour(),
                Collectors.counting()
            ));

        List<Map<String, Object>> peakHours = ordersByHour.entrySet().stream()
            .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
            .map(entry -> {
                Map<String, Object> hour = new HashMap<>();
                hour.put("hour", entry.getKey());
                hour.put("orderCount", entry.getValue());
                return hour;
            })
            .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("period", days + " days");
        result.put("peakHours", peakHours);

        return result;
    }

    /**
     * Get payment methods analytics
     */
    @GetMapping("/payment-methods")
    public Map<String, Object> getPaymentMethods(@RequestParam(defaultValue = "30") int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Order> orders = orderRepository.findByCreatedAtAfter(startDate);

        Map<String, Long> paymentMethodCounts = orders.stream()
            .filter(o -> o.getPaymentMethod() != null)
            .collect(Collectors.groupingBy(order -> order.getPaymentMethod().name(), Collectors.counting()));

        Map<String, BigDecimal> paymentMethodRevenue = new HashMap<>();
        for (Order order : orders) {
            if (order.getPaymentMethod() != null && order.getTotalAmount() != null) {
                paymentMethodRevenue.merge(
                    order.getPaymentMethod().name(),
                    order.getTotalAmount(),
                    BigDecimal::add
                );
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("period", days + " days");
        result.put("paymentMethodCounts", paymentMethodCounts);
        result.put("paymentMethodRevenue", paymentMethodRevenue);

        return result;
    }
}
