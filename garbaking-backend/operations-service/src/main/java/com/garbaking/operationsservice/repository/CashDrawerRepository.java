package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.CashDrawer;
import com.garbaking.operationsservice.model.CashDrawerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CashDrawerRepository extends JpaRepository<CashDrawer, Long> {
    
    Optional<CashDrawer> findByTerminalId(String terminalId);
    
    List<CashDrawer> findByLocation(String location);
    
    List<CashDrawer> findByStatus(CashDrawerStatus status);
}
