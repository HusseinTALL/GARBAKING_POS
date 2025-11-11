package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.CashTransaction;
import com.garbaking.operationsservice.model.CashTransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Repository
public interface CashTransactionRepository extends JpaRepository<CashTransaction, Long> {
    
    List<CashTransaction> findBySessionId(Long sessionId);
    
    List<CashTransaction> findByType(CashTransactionType type);
    
    List<CashTransaction> findBySessionIdAndType(Long sessionId, CashTransactionType type);
    
    List<CashTransaction> findByCreatedAtBetween(Instant start, Instant end);
    
    @Query("SELECT SUM(t.amount) FROM CashTransaction t WHERE t.sessionId = :sessionId AND t.type = :type")
    BigDecimal sumAmountBySessionIdAndType(Long sessionId, CashTransactionType type);
    
    @Query("SELECT SUM(t.amount) FROM CashTransaction t WHERE t.sessionId = :sessionId")
    BigDecimal sumAmountBySessionId(Long sessionId);
}
