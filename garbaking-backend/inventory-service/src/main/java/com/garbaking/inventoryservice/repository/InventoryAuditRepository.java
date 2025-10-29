package com.garbaking.inventoryservice.repository;

import com.garbaking.inventoryservice.model.InventoryAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface InventoryAuditRepository extends JpaRepository<InventoryAudit, Long> {

    Page<InventoryAudit> findByMenuItemId(Long menuItemId, Pageable pageable);

    Page<InventoryAudit> findByMenuItemIdAndCreatedAtBetween(Long menuItemId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<InventoryAudit> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);
}
