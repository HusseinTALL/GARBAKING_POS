package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.CashReconciliation;
import com.garbaking.operationsservice.model.ReconciliationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface CashReconciliationRepository extends JpaRepository<CashReconciliation, Long> {
    
    Optional<CashReconciliation> findBySessionId(Long sessionId);
    
    List<CashReconciliation> findByStatus(ReconciliationStatus status);
    
    List<CashReconciliation> findByReconciledAtBetween(Instant start, Instant end);
    
    List<CashReconciliation> findByReconciledBy(Long userId);
}
