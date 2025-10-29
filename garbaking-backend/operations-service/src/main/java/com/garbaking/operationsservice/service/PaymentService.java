package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.PaymentChargeRequest;
import com.garbaking.operationsservice.dto.PaymentMethodUpdateRequest;
import com.garbaking.operationsservice.dto.PaymentRefundRequest;
import com.garbaking.operationsservice.model.PaymentMethod;
import com.garbaking.operationsservice.model.PaymentMethodStatus;
import com.garbaking.operationsservice.model.PaymentStatus;
import com.garbaking.operationsservice.model.PaymentTransaction;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final Map<String, PaymentMethod> methods = new ConcurrentHashMap<>();
    private final Map<Long, PaymentTransaction> transactions = new ConcurrentHashMap<>();
    private final AtomicLong transactionIdSequence = new AtomicLong(1);

    public PaymentService() {
        registerDefaultMethods();
    }

    public PaymentTransaction charge(PaymentChargeRequest request) {
        PaymentMethod method = requireMethod(request.getPaymentMethod());
        if (method.getStatus() != PaymentMethodStatus.ENABLED) {
            throw new IllegalStateException("Payment method is disabled");
        }
        PaymentTransaction transaction = PaymentTransaction
            .builder()
            .id(transactionIdSequence.getAndIncrement())
            .orderId(request.getOrderId())
            .amount(request.getAmount())
            .paymentMethod(request.getPaymentMethod())
            .status(PaymentStatus.CAPTURED)
            .processedAt(Instant.now())
            .tipAmount(request.getTipAmount())
            .reference("PMT-" + Instant.now().toEpochMilli())
            .build();
        transactions.put(transaction.getId(), transaction);
        return transaction;
    }

    public PaymentTransaction refund(PaymentRefundRequest request) {
        PaymentTransaction original = requireTransaction(request.getTransactionId());
        if (original.getAmount().compareTo(request.getAmount()) < 0) {
            throw new IllegalArgumentException("Refund cannot exceed the original amount");
        }
        PaymentTransaction refund = PaymentTransaction
            .builder()
            .id(transactionIdSequence.getAndIncrement())
            .orderId(original.getOrderId())
            .amount(request.getAmount().negate())
            .paymentMethod(original.getPaymentMethod())
            .status(PaymentStatus.REFUNDED)
            .processedAt(Instant.now())
            .tipAmount(BigDecimal.ZERO)
            .reference("RFND-" + Instant.now().toEpochMilli())
            .build();
        transactions.put(refund.getId(), refund);
        original.setStatus(PaymentStatus.REFUNDED);
        return refund;
    }

    public List<PaymentMethod> listMethods() {
        return new ArrayList<>(methods.values());
    }

    public PaymentMethod updateMethod(String methodCode, PaymentMethodUpdateRequest request) {
        PaymentMethod method = requireMethod(methodCode);
        method.setStatus(request.getStatus());
        if (request.getSupportsTips() != null) {
            method.setSupportsTips(request.getSupportsTips());
        }
        return method;
    }

    public List<PaymentTransaction> listTransactions() {
        return new ArrayList<>(transactions.values());
    }

    public Map<String, BigDecimal> calculatePaymentBreakdown() {
        Map<String, BigDecimal> breakdown = new HashMap<>();
        for (PaymentTransaction transaction : transactions.values()) {
            if (transaction.getStatus() == PaymentStatus.CAPTURED) {
                breakdown.merge(transaction.getPaymentMethod(), transaction.getAmount(), BigDecimal::add);
            }
        }
        return breakdown;
    }

    private void registerDefaultMethods() {
        methods.put(
            "CASH",
            PaymentMethod
                .builder()
                .code("CASH")
                .displayName("Cash")
                .status(PaymentMethodStatus.ENABLED)
                .supportsTips(true)
                .build()
        );
        methods.put(
            "CARD",
            PaymentMethod
                .builder()
                .code("CARD")
                .displayName("Credit/Debit Card")
                .status(PaymentMethodStatus.ENABLED)
                .supportsTips(true)
                .build()
        );
        methods.put(
            "WALLET",
            PaymentMethod
                .builder()
                .code("WALLET")
                .displayName("Digital Wallet")
                .status(PaymentMethodStatus.ENABLED)
                .supportsTips(false)
                .build()
        );
    }

    private PaymentMethod requireMethod(String code) {
        PaymentMethod method = methods.get(code);
        if (method == null) {
            throw new IllegalArgumentException("Payment method not found");
        }
        return method;
    }

    private PaymentTransaction requireTransaction(Long transactionId) {
        PaymentTransaction transaction = transactions.get(transactionId);
        if (transaction == null) {
            throw new IllegalArgumentException("Payment transaction not found");
        }
        return transaction;
    }
}
