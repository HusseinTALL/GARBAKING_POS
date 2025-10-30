package com.garbaking.orderservice.bootstrap;

import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.model.OrderItem;
import com.garbaking.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Populates the order service with demo orders and items so analytics,
 * dashboards and kitchen screens have meaningful data immediately.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SampleDataLoader implements CommandLineRunner {

    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (orderRepository.count() > 0) {
            return;
        }

        log.info("Order repository empty, seeding demo orders…");

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        Order breakfastRush = createCompletedOrder(
                "ORD-" + today + "-0001",
                1L,
                "Amelia Baker",
                "DINE_IN table 4",
                now.with(LocalTime.of(8, 15)),
                List.of(
                        buildItem(1L, "Classic Butter Croissant", "CRS-001", 2, new BigDecimal("3.50"), OrderItem.ItemStatus.SERVED),
                        buildItem(5L, "Vanilla Bean Latte", "BEV-210", 1, new BigDecimal("4.60"), OrderItem.ItemStatus.SERVED)
                ),
                new BigDecimal("1.52"),
                BigDecimal.ZERO
        );
        breakfastRush.setPaymentMethod(Order.PaymentMethod.CARD);
        breakfastRush.setNotes("Customer asked for extra warm milk on the side.");
        breakfastRush.setUpdatedAt(breakfastRush.getCompletedAt());

        Order takeawayLunch = createPreparingOrder(
                "ORD-" + today + "-0008",
                2L,
                "Noah Clerk",
                "TAKEAWAY ticket",
                now.minusHours(2),
                List.of(
                        buildItem(3L, "Roasted Turkey Baguette", "SND-101", 1, new BigDecimal("8.90"), OrderItem.ItemStatus.PREPARING),
                        buildItem(4L, "Mediterranean Veggie Panini", "SND-105", 1, new BigDecimal("7.80"), OrderItem.ItemStatus.PREPARING),
                        buildItem(6L, "Hibiscus Iced Tea", "BEV-305", 2, new BigDecimal("3.90"), OrderItem.ItemStatus.PENDING)
                ),
                new BigDecimal("2.08"),
                new BigDecimal("1.50")
        );
        takeawayLunch.setNotes("Pack with compostable utensils. Customer arriving at noon.");
        takeawayLunch.setUpdatedAt(takeawayLunch.getCreatedAt().plusMinutes(18));

        Order deliveryEvening = createReadyOrder(
                "ORD-" + today + "-0015",
                4L,
                "Oumar Customer",
                "DELIVERY - Riviera 3",
                now.minusHours(1),
                List.of(
                        buildItem(1L, "Classic Butter Croissant", "CRS-001", 6, new BigDecimal("3.50"), OrderItem.ItemStatus.READY),
                        buildItem(2L, "Pain au Chocolat", "CRS-002", 4, new BigDecimal("3.80"), OrderItem.ItemStatus.READY),
                        buildItem(6L, "Hibiscus Iced Tea", "BEV-305", 4, new BigDecimal("3.90"), OrderItem.ItemStatus.READY)
                ),
                new BigDecimal("4.90"),
                BigDecimal.ZERO
        );
        deliveryEvening.setDeliveryAddress("Villa 17, Rue des Marronniers, Riviera 3");
        deliveryEvening.setDeliveryInstructions("Call when arriving, guard has instructions.");
        deliveryEvening.setDeliveryFee(new BigDecimal("3.50"));
        deliveryEvening.setPaymentMethod(Order.PaymentMethod.MOBILE_MONEY);
        deliveryEvening.calculateTotals();
        deliveryEvening.setUpdatedAt(deliveryEvening.getCreatedAt().plusMinutes(35));

        Order pendingBreakfast = createPendingOrder(
                "ORD-" + today + "-0020",
                3L,
                "Lina Chef",
                now.minusMinutes(25),
                List.of(
                        buildItem(5L, "Vanilla Bean Latte", "BEV-210", 1, new BigDecimal("4.60"), OrderItem.ItemStatus.PENDING),
                        buildItem(1L, "Classic Butter Croissant", "CRS-001", 1, new BigDecimal("3.50"), OrderItem.ItemStatus.PENDING)
                ),
                new BigDecimal("0.82")
        );
        pendingBreakfast.setUpdatedAt(pendingBreakfast.getCreatedAt());
        pendingBreakfast.setPaymentMethod(Order.PaymentMethod.CASH);

        Order cancelledOrder = createCancelledOrder(
                "ORD-" + today + "-0025",
                4L,
                "Oumar Customer",
                now.minusDays(1).with(LocalTime.of(18, 30)),
                "Customer called to cancel due to change of plans",
                List.of(
                        buildItem(3L, "Roasted Turkey Baguette", "SND-101", 2, new BigDecimal("8.90"), OrderItem.ItemStatus.PENDING),
                        buildItem(6L, "Hibiscus Iced Tea", "BEV-305", 2, new BigDecimal("3.90"), OrderItem.ItemStatus.PENDING)
                ),
                new BigDecimal("2.45")
        );
        cancelledOrder.setUpdatedAt(cancelledOrder.getCancelledAt());

        orderRepository.saveAll(List.of(
                breakfastRush,
                takeawayLunch,
                deliveryEvening,
                pendingBreakfast,
                cancelledOrder
        ));

        log.info("Seeded {} demo orders for analytics and dashboards", orderRepository.count());
    }

    private OrderItem buildItem(Long menuItemId, String name, String sku, int quantity,
                                BigDecimal unitPrice, OrderItem.ItemStatus status) {
        OrderItem item = OrderItem.builder()
                .menuItemId(menuItemId)
                .menuItemName(name)
                .menuItemSku(sku)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .status(status)
                .build();
        item.calculateSubtotal();
        return item;
    }

    private Order createCompletedOrder(String orderNumber,
                                       Long userId,
                                       String customerName,
                                       String tableInfo,
                                       LocalDateTime createdAt,
                                       List<OrderItem> items,
                                       BigDecimal tax,
                                       BigDecimal discount) {
        Order order = baseOrder(orderNumber, userId, customerName, createdAt, items, tax, discount);
        order.setOrderType(Order.OrderType.DINE_IN);
        order.setTableNumber(tableInfo);
        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setPaymentMethod(Order.PaymentMethod.CARD);
        order.setConfirmedAt(createdAt.plusMinutes(3));
        order.setCompletedAt(createdAt.plusMinutes(30));
        order.setPaidAt(order.getCompletedAt());
        return order;
    }

    private Order createPreparingOrder(String orderNumber,
                                       Long userId,
                                       String customerName,
                                       String notes,
                                       LocalDateTime createdAt,
                                       List<OrderItem> items,
                                       BigDecimal tax,
                                       BigDecimal discount) {
        Order order = baseOrder(orderNumber, userId, customerName, createdAt, items, tax, discount);
        order.setOrderType(Order.OrderType.TAKEAWAY);
        order.setStatus(Order.OrderStatus.PREPARING);
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setPaymentMethod(Order.PaymentMethod.CARD);
        order.setConfirmedAt(createdAt.plusMinutes(5));
        order.setNotes(notes);
        return order;
    }

    private Order createReadyOrder(String orderNumber,
                                   Long userId,
                                   String customerName,
                                   String notes,
                                   LocalDateTime createdAt,
                                   List<OrderItem> items,
                                   BigDecimal tax,
                                   BigDecimal discount) {
        Order order = baseOrder(orderNumber, userId, customerName, createdAt, items, tax, discount);
        order.setOrderType(Order.OrderType.DELIVERY);
        order.setStatus(Order.OrderStatus.READY);
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setPaymentMethod(Order.PaymentMethod.MOBILE_MONEY);
        order.setConfirmedAt(createdAt.plusMinutes(4));
        order.setNotes(notes);
        return order;
    }

    private Order createPendingOrder(String orderNumber,
                                     Long userId,
                                     String customerName,
                                     LocalDateTime createdAt,
                                     List<OrderItem> items,
                                     BigDecimal tax) {
        Order order = baseOrder(orderNumber, userId, customerName, createdAt, items, tax, BigDecimal.ZERO);
        order.setOrderType(Order.OrderType.DINE_IN);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setTableNumber("Table 7");
        return order;
    }

    private Order createCancelledOrder(String orderNumber,
                                       Long userId,
                                       String customerName,
                                       LocalDateTime createdAt,
                                       String reason,
                                       List<OrderItem> items,
                                       BigDecimal tax) {
        Order order = baseOrder(orderNumber, userId, customerName, createdAt, items, tax, BigDecimal.ZERO);
        order.setOrderType(Order.OrderType.TAKEAWAY);
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        order.setPaymentMethod(Order.PaymentMethod.CARD);
        order.setCancellationReason(reason);
        order.setCancelledAt(createdAt.plusMinutes(10));
        return order;
    }

    private Order baseOrder(String orderNumber,
                            Long userId,
                            String customerName,
                            LocalDateTime createdAt,
                            List<OrderItem> items,
                            BigDecimal tax,
                            BigDecimal discount) {
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .customerName(customerName)
                .status(Order.OrderStatus.PENDING)
                .orderType(Order.OrderType.DINE_IN)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .subtotal(BigDecimal.ZERO)
                .taxAmount(tax)
                .discountAmount(discount)
                .totalAmount(BigDecimal.ZERO)
                .createdAt(createdAt)
                .updatedAt(createdAt)
                .build();

        items.forEach(order::addItem);
        order.calculateTotals();
        order.setTotalAmount(order.getTotalAmount()); // ensure field updated
        order.setUpdatedAt(createdAt.plusMinutes(1));
        return order;
    }
}
