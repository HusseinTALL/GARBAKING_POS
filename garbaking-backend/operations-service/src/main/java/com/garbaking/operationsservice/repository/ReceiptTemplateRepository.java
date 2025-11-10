package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.ReceiptTemplate;
import com.garbaking.operationsservice.model.ReceiptType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptTemplateRepository extends JpaRepository<ReceiptTemplate, Long> {
    
    List<ReceiptTemplate> findByType(ReceiptType type);
    
    Optional<ReceiptTemplate> findByTypeAndIsDefaultTrue(ReceiptType type);
    
    List<ReceiptTemplate> findByActive(boolean active);
}
