package com.garbaking.orderservice.repository;

import com.garbaking.orderservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Order Repository
 *
 * Spring Data JPA repository for Order entity.
 * Provides custom queries for order management.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Find order by order number
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Find orders by user ID
     */
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find orders by customer phone
     */
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.customerPhone = :customerPhone ORDER BY o.createdAt DESC")
    List<Order> findByCustomerPhoneWithItems(@Param("customerPhone") String customerPhone);

    /**
     * Find orders by status
     */
    List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);

    /**
     * Find orders by status (multiple statuses)
     */
    List<Order> findByStatusInOrderByCreatedAtDesc(List<Order.OrderStatus> statuses);

    /**
     * Find orders by order type
     */
    List<Order> findByOrderTypeOrderByCreatedAtDesc(Order.OrderType orderType);

    /**
     * Find orders by payment status
     */
    List<Order> findByPaymentStatusOrderByCreatedAtDesc(Order.PaymentStatus paymentStatus);

    /**
     * Find orders by user and status
     */
    List<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Order.OrderStatus status);

    /**
     * Find orders by date range
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Find orders by user and date range
     */
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find today's orders
     */
    @Query("SELECT o FROM Order o WHERE DATE(o.createdAt) = CURRENT_DATE ORDER BY o.createdAt DESC")
    List<Order> findTodaysOrders();

    /**
     * Find active orders (not completed or cancelled)
     */
    @Query("SELECT o FROM Order o WHERE o.status NOT IN ('COMPLETED', 'CANCELLED') ORDER BY o.createdAt DESC")
    List<Order> findActiveOrders();

    /**
     * Find orders with items
     */
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    /**
     * Find orders by order number with items
     */
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.orderNumber = :orderNumber")
    Optional<Order> findByOrderNumberWithItems(@Param("orderNumber") String orderNumber);

    /**
     * Count orders by status
     */
    long countByStatus(Order.OrderStatus status);

    /**
     * Count orders by user
     */
    long countByUserId(Long userId);

    /**
     * Count today's orders
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE DATE(o.createdAt) = CURRENT_DATE")
    long countTodaysOrders();

    /**
     * Check if order number exists
     */
    boolean existsByOrderNumber(String orderNumber);

    /**
     * Find pending payment orders
     */
    @Query("SELECT o FROM Order o WHERE o.paymentStatus = 'PENDING' AND o.status NOT IN ('CANCELLED', 'COMPLETED') ORDER BY o.createdAt DESC")
    List<Order> findPendingPaymentOrders();

    /**
     * Find orders created after a specific date/time
     */
    List<Order> findByCreatedAtAfter(LocalDateTime dateTime);

    /**
     * Find orders created between two dates
     */
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Find orders created between two dates with items eagerly loaded
     */
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.createdAt BETWEEN :start AND :end ORDER BY o.createdAt DESC")
    List<Order> findByCreatedAtBetweenWithItems(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Find orders by status (multiple statuses)
     */
    @Query("SELECT o FROM Order o WHERE o.status IN :statuses ORDER BY o.createdAt DESC")
    List<Order> findByStatusIn(@Param("statuses") List<Order.OrderStatus> statuses);

    /**
     * Count orders by status collection.
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN :statuses")
    long countByStatusIn(@Param("statuses") List<Order.OrderStatus> statuses);

    /**
     * Find orders created after a specific date with items eagerly loaded
     */
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.createdAt >= :start ORDER BY o.createdAt DESC")
    List<Order> findByCreatedAtAfterWithItems(@Param("start") LocalDateTime start);
}
