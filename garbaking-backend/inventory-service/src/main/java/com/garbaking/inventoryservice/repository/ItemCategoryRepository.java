package com.garbaking.inventoryservice.repository;

import com.garbaking.inventoryservice.model.ItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemCategoryRepository extends JpaRepository<ItemCategory, Long> {

    List<ItemCategory> findByIsActiveTrue();

    List<ItemCategory> findByIsActiveTrueOrderByDisplayOrderAsc();

    Optional<ItemCategory> findByName(String name);

    boolean existsByName(String name);
}
