package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.PaymentChargeRequest;
import com.garbaking.operationsservice.dto.PaymentMethodUpdateRequest;
import com.garbaking.operationsservice.dto.PaymentRefundRequest;
import com.garbaking.operationsservice.model.PaymentMethod;
import com.garbaking.operationsservice.model.PaymentTransaction;
import com.garbaking.operationsservice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    // ==================== Payment Processing ====================

    @PostMapping("/charges")
    public ResponseEntity<PaymentTransaction> charge(@Valid @RequestBody PaymentChargeRequest request) {
        log.info("Processing payment charge for order: {} method: {} amount: {}",
                request.getOrderId(), request.getPaymentMethod(), request.getAmount());

        PaymentTransaction transaction = paymentService.charge(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @PostMapping("/refunds")
    public ResponseEntity<PaymentTransaction> refund(@Valid @RequestBody PaymentRefundRequest request) {
        log.info("Processing refund for transaction: {} amount: {}",
                request.getTransactionId(), request.getAmount());

        PaymentTransaction transaction = paymentService.refund(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    // ==================== Payment Methods Management ====================

    @GetMapping("/methods")
    public ResponseEntity<List<PaymentMethod>> listMethods() {
        List<PaymentMethod> methods = paymentService.listMethods();
        return ResponseEntity.ok(methods);
    }

    @GetMapping("/methods/{code}")
    public ResponseEntity<PaymentMethod> getMethod(@PathVariable String code) {
        PaymentMethod method = paymentService.getMethod(code);
        return ResponseEntity.ok(method);
    }

    @PutMapping("/methods/{methodCode}")
    public ResponseEntity<PaymentMethod> updateMethod(
            @PathVariable String methodCode,
            @Valid @RequestBody PaymentMethodUpdateRequest request) {

        log.info("Updating payment method: {} status: {}", methodCode, request.getStatus());
        PaymentMethod method = paymentService.updateMethod(methodCode, request);
        return ResponseEntity.ok(method);
    }

    // ==================== Transaction Queries ====================

    @GetMapping("/transactions")
    public ResponseEntity<List<PaymentTransaction>> listTransactions() {
        List<PaymentTransaction> transactions = paymentService.listTransactions();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<PaymentTransaction> getTransaction(@PathVariable Long id) {
        PaymentTransaction transaction = paymentService.getTransaction(id);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/transactions/reference/{reference}")
    public ResponseEntity<PaymentTransaction> getTransactionByReference(@PathVariable String reference) {
        PaymentTransaction transaction = paymentService.getTransactionByReference(reference);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/transactions/order/{orderId}")
    public ResponseEntity<List<PaymentTransaction>> getTransactionsByOrderId(@PathVariable String orderId) {
        List<PaymentTransaction> transactions = paymentService.getTransactionsByOrderId(orderId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/transactions/session/{sessionId}")
    public ResponseEntity<List<PaymentTransaction>> getTransactionsBySessionId(@PathVariable Long sessionId) {
        List<PaymentTransaction> transactions = paymentService.getTransactionsBySessionId(sessionId);
        return ResponseEntity.ok(transactions);
    }

    // ==================== Analytics ====================

    @GetMapping("/breakdown")
    public ResponseEntity<Map<String, BigDecimal>> getPaymentBreakdown() {
        Map<String, BigDecimal> breakdown = paymentService.calculatePaymentBreakdown();
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/breakdown/session/{sessionId}")
    public ResponseEntity<Map<String, BigDecimal>> getPaymentBreakdownForSession(@PathVariable Long sessionId) {
        Map<String, BigDecimal> breakdown = paymentService.calculatePaymentBreakdownForSession(sessionId);
        return ResponseEntity.ok(breakdown);
    }
}
