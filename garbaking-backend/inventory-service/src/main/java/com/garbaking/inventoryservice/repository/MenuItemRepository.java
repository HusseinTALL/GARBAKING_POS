package com.garbaking.inventoryservice.repository;

import com.garbaking.inventoryservice.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MenuItem Repository
 *
 * Spring Data JPA repository for MenuItem entity.
 * Provides custom queries for menu item and inventory management.
 */
@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    /**
     * Find menu item by SKU
     */
    Optional<MenuItem> findBySku(String sku);

    /**
     * Find all active and available menu items
     */
    List<MenuItem> findByIsActiveTrueAndIsAvailableTrueOrderByDisplayOrderAsc();

    /**
     * Find menu items by category
     */
    List<MenuItem> findByCategoryIdOrderByDisplayOrderAsc(Long categoryId);

    /**
     * Find active menu items by category
     */
    List<MenuItem> findByCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(Long categoryId);

    /**
     * Find available menu items by category
     */
    List<MenuItem> findByCategoryIdAndIsActiveTrueAndIsAvailableTrueOrderByDisplayOrderAsc(Long categoryId);

    /**
     * Find featured menu items
     */
    List<MenuItem> findByIsFeaturedTrueAndIsActiveTrueOrderByDisplayOrderAsc();

    /**
     * Find menu items with low stock
     */
    @Query("SELECT m FROM MenuItem m WHERE m.isActive = true AND m.stockQuantity <= m.lowStockThreshold")
    List<MenuItem> findLowStockItems();

    /**
     * Find out of stock items
     */
    List<MenuItem> findByStockQuantityAndIsActiveTrue(Integer stockQuantity);

    /**
     * Find menu items by name (case-insensitive search)
     */
    @Query("SELECT m FROM MenuItem m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%')) AND m.isActive = true")
    List<MenuItem> searchByName(@Param("name") String name);

    /**
     * Check if SKU exists
     */
    boolean existsBySku(String sku);

    /**
     * Find all menu items with images
     */
    @Query("SELECT DISTINCT m FROM MenuItem m LEFT JOIN FETCH m.images WHERE m.isActive = true ORDER BY m.displayOrder")
    List<MenuItem> findAllActiveWithImages();

    /**
     * Find menu item with images by ID
     */
    @Query("SELECT m FROM MenuItem m LEFT JOIN FETCH m.images WHERE m.id = :id")
    Optional<MenuItem> findByIdWithImages(@Param("id") Long id);

    /**
     * Count menu items by category
     */
    long countByCategoryId(Long categoryId);

    /**
     * Count active menu items
     */
    long countByIsActive(Boolean isActive);

    /**
     * Count available menu items
     */
    long countByIsAvailableTrue();
}
