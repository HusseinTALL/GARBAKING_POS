package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.PrinterJobRequest;
import com.garbaking.operationsservice.dto.PrinterRegistrationRequest;
import com.garbaking.operationsservice.model.PrinterDevice;
import com.garbaking.operationsservice.model.PrinterJob;
import com.garbaking.operationsservice.model.PrinterStatus;
import com.garbaking.operationsservice.service.PrinterService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/printers")
public class PrinterController {

    private final PrinterService printerService;

    public PrinterController(PrinterService printerService) {
        this.printerService = printerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PrinterDevice registerPrinter(@Valid @RequestBody PrinterRegistrationRequest request) {
        return printerService.registerPrinter(request);
    }

    @GetMapping
    public List<PrinterDevice> listPrinters() {
        return printerService.listPrinters();
    }

    @PutMapping("/{printerId}/status")
    public PrinterDevice updateStatus(@PathVariable Long printerId, @RequestParam PrinterStatus status) {
        return printerService.updatePrinterStatus(printerId, status);
    }

    @PostMapping("/{printerId}/jobs")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public PrinterJob enqueueJob(@PathVariable Long printerId, @Valid @RequestBody PrinterJobRequest request) {
        return printerService.enqueueJob(printerId, request);
    }

    @GetMapping("/{printerId}/jobs")
    public List<PrinterJob> listJobs(@PathVariable Long printerId) {
        return printerService.getJobs(printerId);
    }
}
