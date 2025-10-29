package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.ReceiptCreateRequest;
import com.garbaking.operationsservice.dto.ReceiptExportRequest;
import com.garbaking.operationsservice.model.Receipt;
import com.garbaking.operationsservice.service.ReceiptService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Receipt generateReceipt(@Valid @RequestBody ReceiptCreateRequest request) {
        return receiptService.generateReceipt(request);
    }

    @GetMapping
    public List<Receipt> listReceipts() {
        return receiptService.listReceipts();
    }

    @GetMapping("/{receiptId}")
    public Receipt getReceipt(@PathVariable Long receiptId) {
        return receiptService.getReceipt(receiptId);
    }

    @PostMapping("/{receiptId}/export")
    public String exportReceipt(@PathVariable Long receiptId, @Valid @RequestBody ReceiptExportRequest request) {
        return receiptService.exportReceipt(receiptId, request);
    }
}
