package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.ReceiptCreateRequest;
import com.garbaking.operationsservice.dto.ReceiptExportRequest;
import com.garbaking.operationsservice.model.Receipt;
import com.garbaking.operationsservice.model.ReceiptType;
import com.garbaking.operationsservice.service.PrinterService;
import com.garbaking.operationsservice.service.ReceiptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Receipt Controller
 *
 * Manages receipt generation, retrieval, and printing
 */
@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;
    private final PrinterService printerService;

    /**
     * Generate customer receipt
     * POST /api/receipts
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Receipt generateReceipt(@Valid @RequestBody ReceiptCreateRequest request) {
        return receiptService.generateReceipt(request);
    }

    /**
     * Generate kitchen receipt
     * POST /api/receipts/kitchen/{orderId}
     */
    @PostMapping("/kitchen/{orderId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Receipt generateKitchenReceipt(@PathVariable String orderId) {
        return receiptService.generateKitchenReceipt(orderId);
    }

    /**
     * Get all receipts
     * GET /api/receipts
     */
    @GetMapping
    public List<Receipt> listReceipts(
            @RequestParam(required = false) ReceiptType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        if (type != null) {
            return receiptService.listReceiptsByType(type);
        } else if (startDate != null && endDate != null) {
            return receiptService.listReceiptsByDateRange(startDate, endDate);
        } else {
            return receiptService.listReceipts();
        }
    }

    /**
     * Get receipt by ID
     * GET /api/receipts/{receiptId}
     */
    @GetMapping("/{receiptId}")
    public Receipt getReceipt(@PathVariable Long receiptId) {
        return receiptService.getReceipt(receiptId);
    }

    /**
     * Get receipt by receipt number
     * GET /api/receipts/number/{receiptNumber}
     */
    @GetMapping("/number/{receiptNumber}")
    public Receipt getReceiptByNumber(@PathVariable String receiptNumber) {
        return receiptService.getReceiptByNumber(receiptNumber);
    }

    /**
     * Get receipt by order ID
     * GET /api/receipts/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public Receipt getReceiptByOrderId(@PathVariable String orderId) {
        return receiptService.getReceiptByOrderId(orderId);
    }

    /**
     * Export receipt (CSV or PDF)
     * POST /api/receipts/{receiptId}/export
     */
    @PostMapping("/{receiptId}/export")
    public String exportReceipt(
            @PathVariable Long receiptId,
            @Valid @RequestBody ReceiptExportRequest request
    ) {
        return receiptService.exportReceipt(receiptId, request);
    }

    /**
     * Get receipt plain text preview
     * GET /api/receipts/{receiptId}/preview
     */
    @GetMapping("/{receiptId}/preview")
    public Map<String, String> getReceiptPreview(@PathVariable Long receiptId) {
        Receipt receipt = receiptService.getReceipt(receiptId);
        return Map.of(
                "receiptNumber", receipt.getReceiptNumber(),
                "plainText", receipt.getPlainText() != null ? receipt.getPlainText() : "Preview not available"
        );
    }

    /**
     * Print receipt to specific printer
     * POST /api/receipts/{receiptId}/print/{printerId}
     */
    @PostMapping("/{receiptId}/print/{printerId}")
    public ResponseEntity<Map<String, String>> printReceipt(
            @PathVariable Long receiptId,
            @PathVariable Long printerId
    ) {
        printerService.printNow(printerId, receiptId);
        return ResponseEntity.ok(Map.of(
                "message", "Print job submitted",
                "receiptId", receiptId.toString(),
                "printerId", printerId.toString()
        ));
    }

    /**
     * Auto-route receipt to appropriate printers
     * POST /api/receipts/{receiptId}/print/auto
     */
    @PostMapping("/{receiptId}/print/auto")
    public ResponseEntity<Map<String, Object>> autoPrintReceipt(@PathVariable Long receiptId) {
        var jobs = printerService.autoRoutePrint(receiptId);
        return ResponseEntity.ok(Map.of(
                "message", "Receipt routed to " + jobs.size() + " printer(s)",
                "jobCount", jobs.size(),
                "jobs", jobs
        ));
    }

    /**
     * Reprint receipt
     * POST /api/receipts/{receiptId}/reprint/{printerId}
     */
    @PostMapping("/{receiptId}/reprint/{printerId}")
    public ResponseEntity<Map<String, String>> reprintReceipt(
            @PathVariable Long receiptId,
            @PathVariable Long printerId
    ) {
        // Use existing print functionality - it uses stored commands for exact reprint
        printerService.printNow(printerId, receiptId);
        return ResponseEntity.ok(Map.of(
                "message", "Reprint job submitted",
                "receiptId", receiptId.toString()
        ));
    }
}
