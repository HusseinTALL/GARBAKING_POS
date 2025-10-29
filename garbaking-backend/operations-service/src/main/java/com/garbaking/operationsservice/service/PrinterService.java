package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.PrinterJobRequest;
import com.garbaking.operationsservice.dto.PrinterRegistrationRequest;
import com.garbaking.operationsservice.model.PrinterDevice;
import com.garbaking.operationsservice.model.PrinterJob;
import com.garbaking.operationsservice.model.PrinterJobStatus;
import com.garbaking.operationsservice.model.PrinterStatus;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class PrinterService {

    private final Map<Long, PrinterDevice> printers = new ConcurrentHashMap<>();
    private final Map<Long, Deque<PrinterJob>> printerQueues = new ConcurrentHashMap<>();
    private final AtomicLong printerIdSequence = new AtomicLong(1);
    private final AtomicLong jobIdSequence = new AtomicLong(1);

    public PrinterDevice registerPrinter(PrinterRegistrationRequest request) {
        PrinterDevice device = PrinterDevice
            .builder()
            .id(printerIdSequence.getAndIncrement())
            .name(request.getName())
            .location(request.getLocation())
            .status(PrinterStatus.ONLINE)
            .lastHeartbeat(Instant.now())
            .build();
        printers.put(device.getId(), device);
        printerQueues.put(device.getId(), new ArrayDeque<>());
        return device;
    }

    public List<PrinterDevice> listPrinters() {
        return new ArrayList<>(printers.values());
    }

    public PrinterDevice updatePrinterStatus(Long printerId, PrinterStatus status) {
        PrinterDevice device = requirePrinter(printerId);
        device.setStatus(status);
        device.setLastHeartbeat(Instant.now());
        return device;
    }

    public PrinterJob enqueueJob(Long printerId, PrinterJobRequest request) {
        PrinterDevice device = requirePrinter(printerId);
        if (device.getStatus() == PrinterStatus.OFFLINE || device.getStatus() == PrinterStatus.ERROR) {
            throw new IllegalStateException("Printer is not available");
        }
        PrinterJob job = PrinterJob
            .builder()
            .id(jobIdSequence.getAndIncrement())
            .printerId(printerId)
            .payloadType(request.getPayloadType())
            .referenceId(request.getReferenceId())
            .status(PrinterJobStatus.QUEUED)
            .enqueuedAt(Instant.now())
            .build();
        printerQueues.computeIfAbsent(printerId, unused -> new ArrayDeque<>()).add(job);
        return job;
    }

    public List<PrinterJob> getJobs(Long printerId) {
        Deque<PrinterJob> queue = printerQueues.get(printerId);
        return queue == null ? List.of() : new ArrayList<>(queue);
    }

    public Map<Long, Deque<PrinterJob>> getPrinterQueues() {
        return printerQueues;
    }

    private PrinterDevice requirePrinter(Long printerId) {
        PrinterDevice device = printers.get(printerId);
        if (device == null) {
            throw new IllegalArgumentException("Printer not found");
        }
        return device;
    }
}
