package com.garbaking.inventoryservice.repository;

import com.garbaking.inventoryservice.model.InventoryItem;
import com.garbaking.inventoryservice.model.PurchaseOrder;
import com.garbaking.inventoryservice.model.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {

    List<PurchaseOrderItem> findByPurchaseOrder(PurchaseOrder purchaseOrder);

    List<PurchaseOrderItem> findByItem(InventoryItem item);

    @Query("SELECT poi FROM PurchaseOrderItem poi WHERE poi.purchaseOrder = :po AND poi.quantityReceived < poi.quantityOrdered")
    List<PurchaseOrderItem> findUnreceivedItems(@Param("po") PurchaseOrder purchaseOrder);

    @Query("SELECT SUM(poi.lineTotal) FROM PurchaseOrderItem poi WHERE poi.purchaseOrder = :po")
    java.math.BigDecimal calculateTotalForPurchaseOrder(@Param("po") PurchaseOrder purchaseOrder);
}
