package com.garbaking.inventoryservice.repository;

import com.garbaking.inventoryservice.model.InventoryLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryLocationRepository extends JpaRepository<InventoryLocation, Long> {

    List<InventoryLocation> findByIsActiveTrue();

    Optional<InventoryLocation> findByLocationCode(String locationCode);

    Optional<InventoryLocation> findByIsPrimaryTrue();

    boolean existsByLocationCode(String locationCode);
}
