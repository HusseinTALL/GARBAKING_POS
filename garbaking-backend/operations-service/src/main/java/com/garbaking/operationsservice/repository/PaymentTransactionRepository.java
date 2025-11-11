package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    
    Optional<PaymentTransaction> findByReference(String reference);
    
    List<PaymentTransaction> findByOrderId(String orderId);
    
    List<PaymentTransaction> findByCashDrawerSessionId(Long sessionId);
    
    List<PaymentTransaction> findByPaymentMethod(String paymentMethod);
    
    List<PaymentTransaction> findByProcessedAtBetween(Instant start, Instant end);
}
