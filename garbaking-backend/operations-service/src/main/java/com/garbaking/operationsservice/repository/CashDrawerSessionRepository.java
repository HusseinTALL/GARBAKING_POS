package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.CashDrawerSession;
import com.garbaking.operationsservice.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface CashDrawerSessionRepository extends JpaRepository<CashDrawerSession, Long> {
    
    Optional<CashDrawerSession> findByCashDrawerIdAndStatus(Long cashDrawerId, SessionStatus status);
    
    List<CashDrawerSession> findByUserId(Long userId);
    
    List<CashDrawerSession> findByCashDrawerId(Long cashDrawerId);
    
    List<CashDrawerSession> findByOpenedAtBetween(Instant start, Instant end);
    
    @Query("SELECT s FROM CashDrawerSession s WHERE s.status = 'OPEN' AND s.cashDrawerId = :cashDrawerId")
    Optional<CashDrawerSession> findOpenSessionByDrawerId(Long cashDrawerId);
}
