package com.garbaking.inventoryservice.repository;

import com.garbaking.inventoryservice.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Category Repository
 *
 * Spring Data JPA repository for Category entity.
 * Provides custom queries for category management.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Find category by name
     */
    Optional<Category> findByName(String name);

    /**
     * Find all active categories ordered by display order
     */
    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();

    /**
     * Find all categories by active status
     */
    List<Category> findByIsActiveOrderByDisplayOrderAsc(Boolean isActive);

    /**
     * Check if category exists by name
     */
    boolean existsByName(String name);

    /**
     * Find categories with menu items count
     */
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.menuItems WHERE c.isActive = true ORDER BY c.displayOrder")
    List<Category> findAllActiveCategoriesWithMenuItems();

    /**
     * Count active categories
     */
    long countByIsActive(Boolean isActive);
}
