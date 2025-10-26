package com.garbaking.inventoryservice.repository;

import com.garbaking.inventoryservice.model.MenuItemImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MenuItemImage Repository
 *
 * Spring Data JPA repository for MenuItemImage entity.
 * Provides custom queries for image management.
 */
@Repository
public interface MenuItemImageRepository extends JpaRepository<MenuItemImage, Long> {

    /**
     * Find all images for a menu item
     */
    List<MenuItemImage> findByMenuItemIdOrderByDisplayOrderAsc(Long menuItemId);

    /**
     * Find primary image for a menu item
     */
    Optional<MenuItemImage> findByMenuItemIdAndIsPrimaryTrue(Long menuItemId);

    /**
     * Delete all images for a menu item
     */
    void deleteByMenuItemId(Long menuItemId);

    /**
     * Count images for a menu item
     */
    long countByMenuItemId(Long menuItemId);
}
