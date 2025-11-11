package com.garbaking.inventoryservice.repository;

import com.garbaking.inventoryservice.model.PurchaseOrder;
import com.garbaking.inventoryservice.model.PurchaseOrderStatus;
import com.garbaking.inventoryservice.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);

    List<PurchaseOrder> findBySupplier(Supplier supplier);

    List<PurchaseOrder> findByOrderDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.status IN :statuses ORDER BY po.orderDate DESC")
    List<PurchaseOrder> findByStatusIn(@Param("statuses") List<PurchaseOrderStatus> statuses);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.expectedDeliveryDate <= :date AND po.status IN ('SUBMITTED', 'APPROVED')")
    List<PurchaseOrder> findOverduePurchaseOrders(@Param("date") LocalDate date);

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status = :status")
    long countByStatus(@Param("status") PurchaseOrderStatus status);

    @Query("SELECT po FROM PurchaseOrder po ORDER BY po.createdAt DESC")
    List<PurchaseOrder> findAllOrderedByCreatedAtDesc();

    boolean existsByOrderNumber(String orderNumber);
}
