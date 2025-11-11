package com.garbaking.inventoryservice.repository;

import com.garbaking.inventoryservice.model.InventoryItem;
import com.garbaking.inventoryservice.model.InventoryLocation;
import com.garbaking.inventoryservice.model.StockLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockLevelRepository extends JpaRepository<StockLevel, Long> {

    Optional<StockLevel> findByItemAndLocation(InventoryItem item, InventoryLocation location);

    List<StockLevel> findByItem(InventoryItem item);

    List<StockLevel> findByLocation(InventoryLocation location);

    List<StockLevel> findByIsLowStockTrue();

    @Query("SELECT s FROM StockLevel s WHERE s.location = :location AND s.isLowStock = true")
    List<StockLevel> findLowStockByLocation(@Param("location") InventoryLocation location);

    @Query("SELECT s FROM StockLevel s WHERE s.location = :location ORDER BY s.lastUpdated DESC")
    List<StockLevel> findAllByLocationOrderByLastUpdatedDesc(@Param("location") InventoryLocation location);

    @Query("SELECT SUM(s.quantityOnHand * s.item.costPerUnit) FROM StockLevel s WHERE s.location = :location")
    java.math.BigDecimal calculateTotalStockValue(@Param("location") InventoryLocation location);

    @Query("SELECT COUNT(s) FROM StockLevel s WHERE s.isLowStock = true")
    long countLowStockItems();
}
