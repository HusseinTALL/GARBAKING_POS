package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.Receipt;
import com.garbaking.operationsservice.model.ReceiptType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    
    Optional<Receipt> findByReceiptNumber(String receiptNumber);
    
    Optional<Receipt> findByOrderId(String orderId);
    
    List<Receipt> findByType(ReceiptType type);
    
    List<Receipt> findByPrinted(boolean printed);
    
    List<Receipt> findByGeneratedAtBetween(Instant start, Instant end);
    
    List<Receipt> findByOrderIdAndType(String orderId, ReceiptType type);
}
