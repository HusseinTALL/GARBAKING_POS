package com.garbaking.inventoryservice.repository;

import com.garbaking.inventoryservice.model.InventoryItem;
import com.garbaking.inventoryservice.model.ItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByIsActiveTrue();

    List<InventoryItem> findByCategoryAndIsActiveTrue(ItemCategory category);

    Optional<InventoryItem> findBySku(String sku);

    Optional<InventoryItem> findByBarcode(String barcode);

    boolean existsBySku(String sku);

    @Query("SELECT i FROM InventoryItem i WHERE " +
           "LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.sku) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<InventoryItem> searchItems(@Param("search") String search);

    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.isActive = true")
    long countActiveItems();
}
