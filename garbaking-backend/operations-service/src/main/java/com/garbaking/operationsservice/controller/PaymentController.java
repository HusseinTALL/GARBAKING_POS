package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.PaymentChargeRequest;
import com.garbaking.operationsservice.dto.PaymentMethodUpdateRequest;
import com.garbaking.operationsservice.dto.PaymentRefundRequest;
import com.garbaking.operationsservice.model.PaymentMethod;
import com.garbaking.operationsservice.model.PaymentTransaction;
import com.garbaking.operationsservice.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/charges")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentTransaction charge(@Valid @RequestBody PaymentChargeRequest request) {
        return paymentService.charge(request);
    }

    @PostMapping("/refunds")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentTransaction refund(@Valid @RequestBody PaymentRefundRequest request) {
        return paymentService.refund(request);
    }

    @GetMapping("/methods")
    public List<PaymentMethod> listMethods() {
        return paymentService.listMethods();
    }

    @PutMapping("/methods/{methodCode}")
    public PaymentMethod updateMethod(@PathVariable String methodCode, @Valid @RequestBody PaymentMethodUpdateRequest request) {
        return paymentService.updateMethod(methodCode, request);
    }

    @GetMapping("/transactions")
    public List<PaymentTransaction> listTransactions() {
        return paymentService.listTransactions();
    }
}
