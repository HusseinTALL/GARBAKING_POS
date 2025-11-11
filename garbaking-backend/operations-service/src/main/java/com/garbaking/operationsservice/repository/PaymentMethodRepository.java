package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.PaymentMethod;
import com.garbaking.operationsservice.model.PaymentMethodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, String> {
    
    List<PaymentMethod> findByStatus(PaymentMethodStatus status);
    
    List<PaymentMethod> findBySupportsTips(boolean supportsTips);
}
