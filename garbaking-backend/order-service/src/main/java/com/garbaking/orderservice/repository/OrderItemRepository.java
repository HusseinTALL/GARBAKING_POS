package com.garbaking.orderservice.repository;

import com.garbaking.orderservice.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * OrderItem Repository
 *
 * Spring Data JPA repository for OrderItem entity.
 * Provides custom queries for order item management.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Find order items by order ID
     */
    List<OrderItem> findByOrderId(Long orderId);

    /**
     * Find order items by menu item ID
     */
    List<OrderItem> findByMenuItemId(Long menuItemId);

    /**
     * Find order items by status
     */
    List<OrderItem> findByStatus(OrderItem.ItemStatus status);

    /**
     * Count items by menu item ID
     */
    long countByMenuItemId(Long menuItemId);

    /**
     * Get popular menu items (most ordered)
     */
    @Query("SELECT oi.menuItemId, oi.menuItemName, SUM(oi.quantity) as totalQuantity " +
           "FROM OrderItem oi " +
           "GROUP BY oi.menuItemId, oi.menuItemName " +
           "ORDER BY totalQuantity DESC")
    List<Object[]> findPopularMenuItems();

    /**
     * Get total quantity sold for a menu item
     */
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.menuItemId = :menuItemId")
    Long getTotalQuantitySold(@Param("menuItemId") Long menuItemId);
}
