package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.PaymentChargeRequest;
import com.garbaking.operationsservice.dto.PaymentMethodUpdateRequest;
import com.garbaking.operationsservice.dto.PaymentRefundRequest;
import com.garbaking.operationsservice.model.PaymentMethod;
import com.garbaking.operationsservice.model.PaymentMethodStatus;
import com.garbaking.operationsservice.model.PaymentStatus;
import com.garbaking.operationsservice.model.PaymentTransaction;
import com.garbaking.operationsservice.repository.PaymentMethodRepository;
import com.garbaking.operationsservice.repository.PaymentTransactionRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentTransactionRepository transactionRepository;
    private final PaymentMethodRepository methodRepository;

    @PostConstruct
    public void init() {
        registerDefaultMethods();
    }

    @Transactional
    public PaymentTransaction charge(PaymentChargeRequest request) {
        PaymentMethod method = methodRepository.findById(request.getPaymentMethod())
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found: " + request.getPaymentMethod()));

        if (method.getStatus() != PaymentMethodStatus.ENABLED) {
            throw new IllegalStateException("Payment method is disabled: " + method.getDisplayName());
        }

        PaymentTransaction transaction = PaymentTransaction.builder()
                .orderId(request.getOrderId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.CAPTURED)
                .processedAt(Instant.now())
                .tipAmount(request.getTipAmount() != null ? request.getTipAmount() : BigDecimal.ZERO)
                .reference("PMT-" + Instant.now().toEpochMilli())
                .cashDrawerSessionId(request.getCashDrawerSessionId())
                .build();

        transaction = transactionRepository.save(transaction);
        log.info("Payment charged: {} for order: {} amount: {}",
                transaction.getReference(), request.getOrderId(), request.getAmount());

        return transaction;
    }

    @Transactional
    public PaymentTransaction refund(PaymentRefundRequest request) {
        PaymentTransaction original = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new IllegalArgumentException("Payment transaction not found: " + request.getTransactionId()));

        if (original.getAmount().compareTo(request.getAmount()) < 0) {
            throw new IllegalArgumentException("Refund amount cannot exceed original payment amount");
        }

        PaymentTransaction refund = PaymentTransaction.builder()
                .orderId(original.getOrderId())
                .amount(request.getAmount().negate())
                .paymentMethod(original.getPaymentMethod())
                .status(PaymentStatus.REFUNDED)
                .processedAt(Instant.now())
                .tipAmount(BigDecimal.ZERO)
                .reference("RFND-" + Instant.now().toEpochMilli())
                .cashDrawerSessionId(original.getCashDrawerSessionId())
                .build();

        refund = transactionRepository.save(refund);

        // Update original transaction status
        original.setStatus(PaymentStatus.REFUNDED);
        transactionRepository.save(original);

        log.info("Payment refunded: {} for original: {} amount: {}",
                refund.getReference(), original.getReference(), request.getAmount());

        return refund;
    }

    public List<PaymentMethod> listMethods() {
        return methodRepository.findAll();
    }

    public PaymentMethod getMethod(String code) {
        return methodRepository.findById(code)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found: " + code));
    }

    @Transactional
    public PaymentMethod updateMethod(String methodCode, PaymentMethodUpdateRequest request) {
        PaymentMethod method = methodRepository.findById(methodCode)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found: " + methodCode));

        method.setStatus(request.getStatus());
        if (request.getSupportsTips() != null) {
            method.setSupportsTips(request.getSupportsTips());
        }

        method = methodRepository.save(method);
        log.info("Payment method updated: {} status: {}", methodCode, request.getStatus());

        return method;
    }

    public List<PaymentTransaction> listTransactions() {
        return transactionRepository.findAll();
    }

    public PaymentTransaction getTransaction(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment transaction not found: " + id));
    }

    public PaymentTransaction getTransactionByReference(String reference) {
        return transactionRepository.findByReference(reference)
                .orElseThrow(() -> new IllegalArgumentException("Payment transaction not found with reference: " + reference));
    }

    public List<PaymentTransaction> getTransactionsByOrderId(String orderId) {
        return transactionRepository.findByOrderId(orderId);
    }

    public List<PaymentTransaction> getTransactionsBySessionId(Long sessionId) {
        return transactionRepository.findByCashDrawerSessionId(sessionId);
    }

    public Map<String, BigDecimal> calculatePaymentBreakdown() {
        Map<String, BigDecimal> breakdown = new HashMap<>();
        List<PaymentTransaction> transactions = transactionRepository.findAll();

        for (PaymentTransaction transaction : transactions) {
            if (transaction.getStatus() == PaymentStatus.CAPTURED) {
                breakdown.merge(transaction.getPaymentMethod(), transaction.getAmount(), BigDecimal::add);
            }
        }

        return breakdown;
    }

    public Map<String, BigDecimal> calculatePaymentBreakdownForSession(Long sessionId) {
        Map<String, BigDecimal> breakdown = new HashMap<>();
        List<PaymentTransaction> transactions = transactionRepository.findByCashDrawerSessionId(sessionId);

        for (PaymentTransaction transaction : transactions) {
            if (transaction.getStatus() == PaymentStatus.CAPTURED) {
                breakdown.merge(transaction.getPaymentMethod(), transaction.getAmount(), BigDecimal::add);
            }
        }

        return breakdown;
    }

    private void registerDefaultMethods() {
        // Only create if they don't exist
        if (methodRepository.count() == 0) {
            methodRepository.save(PaymentMethod.builder()
                    .code("CASH")
                    .displayName("Cash")
                    .status(PaymentMethodStatus.ENABLED)
                    .supportsTips(true)
                    .build());

            methodRepository.save(PaymentMethod.builder()
                    .code("CARD")
                    .displayName("Credit/Debit Card")
                    .status(PaymentMethodStatus.ENABLED)
                    .supportsTips(true)
                    .build());

            methodRepository.save(PaymentMethod.builder()
                    .code("WALLET")
                    .displayName("Digital Wallet")
                    .status(PaymentMethodStatus.ENABLED)
                    .supportsTips(false)
                    .build());

            log.info("Default payment methods registered");
        }
    }
}
