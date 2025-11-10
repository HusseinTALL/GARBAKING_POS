package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.PrinterJobRequest;
import com.garbaking.operationsservice.dto.PrinterRegistrationRequest;
import com.garbaking.operationsservice.model.*;
import com.garbaking.operationsservice.printing.NetworkPrinterClient;
import com.garbaking.operationsservice.repository.PrinterDeviceRepository;
import com.garbaking.operationsservice.repository.PrinterJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Printer Service
 *
 * Manages printer devices, print jobs, and queue processing
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PrinterService {

    private final PrinterDeviceRepository printerRepository;
    private final PrinterJobRepository jobRepository;
    private final ReceiptService receiptService;
    private final NetworkPrinterClient networkPrinterClient;

    /**
     * Register a new printer device
     */
    @Transactional
    public PrinterDevice registerPrinter(PrinterRegistrationRequest request) {
        log.info("Registering printer: {} at {}", request.getName(), request.getLocation());

        // Check if printer already exists
        printerRepository.findByNameAndLocation(request.getName(), request.getLocation())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Printer already exists: " + request.getName());
                });

        PrinterDevice device = PrinterDevice.builder()
                .name(request.getName())
                .location(request.getLocation())
                .printerType(request.getPrinterType())
                .ipAddress(request.getIpAddress())
                .port(request.getPort() != null ? request.getPort() : 9100)
                .connectionType(request.getConnectionType() != null ? request.getConnectionType() : PrinterConnectionType.NETWORK)
                .paperWidth(request.getPaperWidth() != null ? request.getPaperWidth() : 48)
                .status(PrinterStatus.OFFLINE)
                .enabled(true)
                .autoPrint(request.getAutoPrint() != null ? request.getAutoPrint() : false)
                .lastHeartbeat(Instant.now())
                .build();

        device = printerRepository.save(device);
        log.info("Printer registered successfully: ID={}", device.getId());

        // Test connection if it's a network printer
        if (device.getConnectionType() == PrinterConnectionType.NETWORK && device.getIpAddress() != null) {
            testConnection(device.getId());
        }

        return device;
    }

    /**
     * Get all printers
     */
    public List<PrinterDevice> listPrinters() {
        return printerRepository.findAll();
    }

    /**
     * Get printer by ID
     */
    public PrinterDevice getPrinter(Long printerId) {
        return printerRepository.findById(printerId)
                .orElseThrow(() -> new IllegalArgumentException("Printer not found: " + printerId));
    }

    /**
     * Get printers by location
     */
    public List<PrinterDevice> getPrintersByLocation(String location) {
        return printerRepository.findByLocation(location);
    }

    /**
     * Get printers by type
     */
    public List<PrinterDevice> getPrintersByType(ReceiptType type) {
        return printerRepository.findByPrinterType(type);
    }

    /**
     * Update printer status
     */
    @Transactional
    public PrinterDevice updatePrinterStatus(Long printerId, PrinterStatus status) {
        PrinterDevice device = getPrinter(printerId);
        device.setStatus(status);
        device.setLastHeartbeat(Instant.now());
        return printerRepository.save(device);
    }

    /**
     * Test printer connection
     */
    public boolean testConnection(Long printerId) {
        PrinterDevice device = getPrinter(printerId);

        if (device.getConnectionType() == PrinterConnectionType.NETWORK) {
            boolean connected = networkPrinterClient.testConnection(
                    device.getIpAddress(),
                    device.getPort()
            );

            updatePrinterStatus(printerId, connected ? PrinterStatus.ONLINE : PrinterStatus.OFFLINE);
            return connected;
        }

        log.warn("Cannot test connection for non-network printer: {}", device.getName());
        return false;
    }

    /**
     * Enqueue print job
     */
    @Transactional
    public PrinterJob enqueuePrintJob(Long printerId, Long receiptId, Integer priority) {
        log.info("Enqueueing print job: printer={}, receipt={}", printerId, receiptId);

        PrinterDevice printer = getPrinter(printerId);
        if (!printer.isEnabled()) {
            throw new IllegalStateException("Printer is disabled: " + printer.getName());
        }

        // Create print job
        PrinterJob job = PrinterJob.builder()
                .printerId(printerId)
                .receiptId(receiptId)
                .status(PrinterJobStatus.QUEUED)
                .enqueuedAt(Instant.now())
                .attempts(0)
                .priority(priority != null ? priority : 5)
                .build();

        job = jobRepository.save(job);
        log.info("Print job enqueued: ID={}", job.getId());

        // If auto-print is enabled, process immediately
        if (printer.isAutoPrint()) {
            processJob(job.getId());
        }

        return job;
    }

    /**
     * Enqueue print job with request
     */
    @Transactional
    public PrinterJob enqueueJob(Long printerId, PrinterJobRequest request) {
        return enqueuePrintJob(printerId, Long.parseLong(request.getReferenceId()), null);
    }

    /**
     * Get print jobs for printer
     */
    public List<PrinterJob> getJobs(Long printerId) {
        return jobRepository.findByPrinterIdOrderByPriorityDescEnqueuedAtAsc(printerId);
    }

    /**
     * Get queued jobs for printer
     */
    public List<PrinterJob> getQueuedJobs(Long printerId) {
        return jobRepository.findByPrinterIdAndStatus(printerId, PrinterJobStatus.QUEUED);
    }

    /**
     * Process a print job (send to printer)
     */
    @Async
    @Transactional
    public void processJob(Long jobId) {
        PrinterJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));

        PrinterDevice printer = getPrinter(job.getPrinterId());

        log.info("Processing print job: ID={}, printer={}", jobId, printer.getName());

        // Update job status
        job.setStatus(PrinterJobStatus.PRINTING);
        job.setStartedAt(Instant.now());
        job.setAttempts(job.getAttempts() + 1);
        jobRepository.save(job);

        try {
            // Get receipt ESC/POS commands
            byte[] commands = receiptService.getReprintCommands(job.getReceiptId());

            // Send to printer based on connection type
            boolean success = false;
            if (printer.getConnectionType() == PrinterConnectionType.NETWORK) {
                success = networkPrinterClient.print(
                        printer.getIpAddress(),
                        printer.getPort(),
                        commands
                );
            } else {
                log.warn("Unsupported connection type: {}", printer.getConnectionType());
                job.setErrorMessage("Unsupported connection type: " + printer.getConnectionType());
            }

            if (success) {
                // Mark job as completed
                job.setStatus(PrinterJobStatus.COMPLETED);
                job.setCompletedAt(Instant.now());

                // Mark receipt as printed
                receiptService.markAsPrinted(job.getReceiptId(), printer.getId());

                log.info("Print job completed successfully: ID={}", jobId);
            } else {
                handlePrintFailure(job, "Print failed");
            }

        } catch (Exception e) {
            log.error("Error processing print job: ID={}", jobId, e);
            handlePrintFailure(job, e.getMessage());
        }

        jobRepository.save(job);
    }

    /**
     * Process all queued jobs for a printer
     */
    @Transactional
    public void processQueue(Long printerId) {
        List<PrinterJob> queuedJobs = getQueuedJobs(printerId);
        log.info("Processing {} queued jobs for printer: {}", queuedJobs.size(), printerId);

        for (PrinterJob job : queuedJobs) {
            processJob(job.getId());
        }
    }

    /**
     * Retry failed job
     */
    @Transactional
    public void retryJob(Long jobId) {
        PrinterJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));

        if (job.getStatus() != PrinterJobStatus.FAILED) {
            throw new IllegalStateException("Can only retry failed jobs");
        }

        if (job.getAttempts() >= 3) {
            throw new IllegalStateException("Maximum retry attempts reached");
        }

        job.setStatus(PrinterJobStatus.QUEUED);
        job.setErrorMessage(null);
        jobRepository.save(job);

        processJob(jobId);
    }

    /**
     * Cancel print job
     */
    @Transactional
    public void cancelJob(Long jobId) {
        PrinterJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));

        if (job.getStatus() == PrinterJobStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel completed job");
        }

        job.setStatus(PrinterJobStatus.FAILED);
        job.setErrorMessage("Cancelled by user");
        job.setCompletedAt(Instant.now());
        jobRepository.save(job);
    }

    /**
     * Print receipt immediately (bypass queue)
     */
    @Transactional
    public void printNow(Long printerId, Long receiptId) {
        PrinterJob job = enqueuePrintJob(printerId, receiptId, 10); // High priority
        processJob(job.getId());
    }

    /**
     * Auto-route receipt to appropriate printer
     */
    @Transactional
    public List<PrinterJob> autoRoutePrint(Long receiptId) {
        Receipt receipt = receiptService.getReceipt(receiptId);
        List<PrinterDevice> printers = printerRepository.findByPrinterType(receipt.getType());

        if (printers.isEmpty()) {
            log.warn("No printers found for receipt type: {}", receipt.getType());
            return List.of();
        }

        return printers.stream()
                .filter(PrinterDevice::isEnabled)
                .filter(printer -> printer.getStatus() == PrinterStatus.ONLINE || printer.isAutoPrint())
                .map(printer -> enqueuePrintJob(printer.getId(), receiptId, 5))
                .toList();
    }

    /**
     * Scheduled: Process all auto-print queues
     */
    @Scheduled(fixedDelay = 10000) // Every 10 seconds
    @Transactional
    public void processAutoPrintQueues() {
        List<PrinterDevice> autoPrintPrinters = printerRepository.findByEnabled(true).stream()
                .filter(PrinterDevice::isAutoPrint)
                .toList();

        for (PrinterDevice printer : autoPrintPrinters) {
            List<PrinterJob> queuedJobs = getQueuedJobs(printer.getId());
            if (!queuedJobs.isEmpty()) {
                log.debug("Auto-processing {} jobs for printer: {}", queuedJobs.size(), printer.getName());
                processQueue(printer.getId());
            }
        }
    }

    /**
     * Scheduled: Check printer heartbeats
     */
    @Scheduled(fixedDelay = 60000) // Every minute
    @Transactional
    public void checkPrinterHeartbeats() {
        List<PrinterDevice> printers = printerRepository.findAll();
        Instant threshold = Instant.now().minus(5, ChronoUnit.MINUTES);

        for (PrinterDevice printer : printers) {
            if (printer.getLastHeartbeat() != null && printer.getLastHeartbeat().isBefore(threshold)) {
                if (printer.getStatus() == PrinterStatus.ONLINE) {
                    log.warn("Printer heartbeat timeout: {}", printer.getName());
                    updatePrinterStatus(printer.getId(), PrinterStatus.OFFLINE);
                }
            }
        }
    }

    /**
     * Scheduled: Cleanup old completed jobs
     */
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    @Transactional
    public void cleanupOldJobs() {
        Instant threshold = Instant.now().minus(30, ChronoUnit.DAYS);
        List<PrinterJob> completedJobs = jobRepository.findByStatus(PrinterJobStatus.COMPLETED);

        long deleted = completedJobs.stream()
                .filter(job -> job.getCompletedAt() != null && job.getCompletedAt().isBefore(threshold))
                .peek(job -> jobRepository.delete(job))
                .count();

        log.info("Cleaned up {} old completed print jobs", deleted);
    }

    // Helper methods

    private void handlePrintFailure(PrinterJob job, String errorMessage) {
        if (job.getAttempts() < 3) {
            // Retry later
            job.setStatus(PrinterJobStatus.QUEUED);
            job.setErrorMessage(errorMessage + " (will retry)");
            log.warn("Print job failed, will retry: ID={}, attempt={}", job.getId(), job.getAttempts());
        } else {
            // Max retries reached
            job.setStatus(PrinterJobStatus.FAILED);
            job.setCompletedAt(Instant.now());
            job.setErrorMessage(errorMessage + " (max retries reached)");
            log.error("Print job failed permanently: ID={}", job.getId());
        }
    }
}
