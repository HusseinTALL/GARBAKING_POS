package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.PayrollEntryDTO;
import com.garbaking.employeeservice.dto.PayrollPeriodDTO;
import com.garbaking.employeeservice.service.PayrollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Payroll operations
 */
@RestController
@RequestMapping("/api/employees/payroll")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/periods")
    public ResponseEntity<PayrollPeriodDTO> createPayrollPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate payDate
    ) {
        log.info("POST /api/employees/payroll/periods - Start: {}, End: {}", startDate, endDate);
        PayrollPeriodDTO period = payrollService.createPayrollPeriod(startDate, endDate, payDate);
        return ResponseEntity.status(HttpStatus.CREATED).body(period);
    }

    @PostMapping("/periods/{periodId}/generate")
    public ResponseEntity<List<PayrollEntryDTO>> generatePayrollEntries(@PathVariable Long periodId) {
        log.info("POST /api/employees/payroll/periods/{}/generate", periodId);
        List<PayrollEntryDTO> entries = payrollService.generatePayrollEntries(periodId);
        return ResponseEntity.ok(entries);
    }

    @PostMapping("/periods/{periodId}/approve")
    public ResponseEntity<PayrollPeriodDTO> approvePayrollPeriod(
            @PathVariable Long periodId,
            @RequestParam Long managerId
    ) {
        log.info("POST /api/employees/payroll/periods/{}/approve by manager {}", periodId, managerId);
        PayrollPeriodDTO period = payrollService.approvePayrollPeriod(periodId, managerId);
        return ResponseEntity.ok(period);
    }

    @PostMapping("/periods/{periodId}/mark-paid")
    public ResponseEntity<PayrollPeriodDTO> markPayrollPaid(@PathVariable Long periodId) {
        log.info("POST /api/employees/payroll/periods/{}/mark-paid", periodId);
        PayrollPeriodDTO period = payrollService.markPayrollPaid(periodId);
        return ResponseEntity.ok(period);
    }

    @GetMapping("/periods")
    public ResponseEntity<List<PayrollPeriodDTO>> getAllPayrollPeriods() {
        log.info("GET /api/employees/payroll/periods");
        List<PayrollPeriodDTO> periods = payrollService.getAllPayrollPeriods();
        return ResponseEntity.ok(periods);
    }

    @GetMapping("/periods/{periodId}")
    public ResponseEntity<PayrollPeriodDTO> getPayrollPeriodById(@PathVariable Long periodId) {
        log.info("GET /api/employees/payroll/periods/{}", periodId);
        PayrollPeriodDTO period = payrollService.getPayrollPeriodById(periodId);
        return ResponseEntity.ok(period);
    }

    @GetMapping("/periods/{periodId}/entries")
    public ResponseEntity<List<PayrollEntryDTO>> getPayrollEntriesForPeriod(
            @PathVariable Long periodId
    ) {
        log.info("GET /api/employees/payroll/periods/{}/entries", periodId);
        List<PayrollEntryDTO> entries = payrollService.getPayrollEntriesForPeriod(periodId);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/employee/{employeeId}/history")
    public ResponseEntity<List<PayrollEntryDTO>> getPayrollHistoryForEmployee(
            @PathVariable Long employeeId
    ) {
        log.info("GET /api/employees/payroll/employee/{}/history", employeeId);
        List<PayrollEntryDTO> entries = payrollService.getPayrollHistoryForEmployee(employeeId);
        return ResponseEntity.ok(entries);
    }
}
