package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.CountType;
import com.garbaking.operationsservice.model.DenominationCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DenominationCountRepository extends JpaRepository<DenominationCount, Long> {
    
    List<DenominationCount> findBySessionId(Long sessionId);
    
    List<DenominationCount> findBySessionIdAndCountType(Long sessionId, CountType countType);
    
    @Query("SELECT SUM(d.total) FROM DenominationCount d WHERE d.sessionId = :sessionId AND d.countType = :countType")
    BigDecimal sumTotalBySessionIdAndCountType(Long sessionId, CountType countType);
}
