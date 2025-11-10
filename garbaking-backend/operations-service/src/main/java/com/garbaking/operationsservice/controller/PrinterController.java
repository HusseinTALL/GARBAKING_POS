package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.PrinterJobRequest;
import com.garbaking.operationsservice.dto.PrinterRegistrationRequest;
import com.garbaking.operationsservice.model.*;
import com.garbaking.operationsservice.service.PrinterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Printer Controller
 *
 * Manages printer devices and print jobs
 */
@RestController
@RequestMapping("/api/printers")
@RequiredArgsConstructor
public class PrinterController {

    private final PrinterService printerService;

    /**
     * Register new printer
     * POST /api/printers
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PrinterDevice registerPrinter(@Valid @RequestBody PrinterRegistrationRequest request) {
        return printerService.registerPrinter(request);
    }

    /**
     * Get all printers
     * GET /api/printers
     */
    @GetMapping
    public List<PrinterDevice> listPrinters(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ReceiptType type
    ) {
        if (location != null) {
            return printerService.getPrintersByLocation(location);
        } else if (type != null) {
            return printerService.getPrintersByType(type);
        } else {
            return printerService.listPrinters();
        }
    }

    /**
     * Get printer by ID
     * GET /api/printers/{printerId}
     */
    @GetMapping("/{printerId}")
    public PrinterDevice getPrinter(@PathVariable Long printerId) {
        return printerService.getPrinter(printerId);
    }

    /**
     * Update printer status
     * PUT /api/printers/{printerId}/status
     */
    @PutMapping("/{printerId}/status")
    public PrinterDevice updatePrinterStatus(
            @PathVariable Long printerId,
            @RequestBody Map<String, String> request
    ) {
        PrinterStatus status = PrinterStatus.valueOf(request.get("status"));
        return printerService.updatePrinterStatus(printerId, status);
    }

    /**
     * Test printer connection
     * POST /api/printers/{printerId}/test
     */
    @PostMapping("/{printerId}/test")
    public ResponseEntity<Map<String, Object>> testPrinter(@PathVariable Long printerId) {
        boolean connected = printerService.testConnection(printerId);
        return ResponseEntity.ok(Map.of(
                "printerId", printerId,
                "connected", connected,
                "message", connected ? "Printer is online" : "Printer is offline"
        ));
    }

    /**
     * Enqueue print job
     * POST /api/printers/{printerId}/jobs
     */
    @PostMapping("/{printerId}/jobs")
    @ResponseStatus(HttpStatus.CREATED)
    public PrinterJob enqueuePrintJob(
            @PathVariable Long printerId,
            @Valid @RequestBody PrinterJobRequest request
    ) {
        return printerService.enqueueJob(printerId, request);
    }

    /**
     * Get all jobs for printer
     * GET /api/printers/{printerId}/jobs
     */
    @GetMapping("/{printerId}/jobs")
    public List<PrinterJob> getPrinterJobs(
            @PathVariable Long printerId,
            @RequestParam(required = false) PrinterJobStatus status
    ) {
        if (status != null && status == PrinterJobStatus.QUEUED) {
            return printerService.getQueuedJobs(printerId);
        } else {
            return printerService.getJobs(printerId);
        }
    }

    /**
     * Process print queue manually
     * POST /api/printers/{printerId}/process
     */
    @PostMapping("/{printerId}/process")
    public ResponseEntity<Map<String, String>> processQueue(@PathVariable Long printerId) {
        printerService.processQueue(printerId);
        return ResponseEntity.ok(Map.of(
                "message", "Processing queue for printer " + printerId
        ));
    }

    /**
     * Retry failed print job
     * POST /api/printers/jobs/{jobId}/retry
     */
    @PostMapping("/jobs/{jobId}/retry")
    public ResponseEntity<Map<String, String>> retryJob(@PathVariable Long jobId) {
        printerService.retryJob(jobId);
        return ResponseEntity.ok(Map.of(
                "message", "Print job retry initiated",
                "jobId", jobId.toString()
        ));
    }

    /**
     * Cancel print job
     * POST /api/printers/jobs/{jobId}/cancel
     */
    @PostMapping("/jobs/{jobId}/cancel")
    public ResponseEntity<Map<String, String>> cancelJob(@PathVariable Long jobId) {
        printerService.cancelJob(jobId);
        return ResponseEntity.ok(Map.of(
                "message", "Print job cancelled",
                "jobId", jobId.toString()
        ));
    }

    /**
     * Get printer statistics
     * GET /api/printers/{printerId}/stats
     */
    @GetMapping("/{printerId}/stats")
    public ResponseEntity<Map<String, Object>> getPrinterStats(@PathVariable Long printerId) {
        List<PrinterJob> allJobs = printerService.getJobs(printerId);

        long completed = allJobs.stream()
                .filter(job -> job.getStatus() == PrinterJobStatus.COMPLETED)
                .count();
        long failed = allJobs.stream()
                .filter(job -> job.getStatus() == PrinterJobStatus.FAILED)
                .count();
        long queued = allJobs.stream()
                .filter(job -> job.getStatus() == PrinterJobStatus.QUEUED)
                .count();

        return ResponseEntity.ok(Map.of(
                "printerId", printerId,
                "totalJobs", allJobs.size(),
                "completed", completed,
                "failed", failed,
                "queued", queued
        ));
    }
}
