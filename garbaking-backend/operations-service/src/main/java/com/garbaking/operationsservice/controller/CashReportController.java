package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.report.*;
import com.garbaking.operationsservice.service.CashReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for cash management reports
 */
@RestController
@RequestMapping("/api/cash-reports")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CashReportController {

    private final CashReportService reportService;

    /**
     * Get daily cash report for a specific date
     */
    @GetMapping("/daily")
    public ResponseEntity<DailyCashReportDTO> getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Fetching daily cash report for date: {}", date);

        DailyCashReportDTO report = reportService.generateDailyReport(date);
        return ResponseEntity.ok(report);
    }

    /**
     * Get daily reports for a date range
     */
    @GetMapping("/daily/range")
    public ResponseEntity<List<DailyCashReportDTO>> getDailyReports(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Fetching daily cash reports from {} to {}", startDate, endDate);

        List<DailyCashReportDTO> reports = new java.util.ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            reports.add(reportService.generateDailyReport(currentDate));
            currentDate = currentDate.plusDays(1);
        }

        return ResponseEntity.ok(reports);
    }

    /**
     * Get today's cash report
     */
    @GetMapping("/daily/today")
    public ResponseEntity<DailyCashReportDTO> getTodayReport() {
        LocalDate today = LocalDate.now();
        log.info("Fetching today's cash report: {}", today);

        DailyCashReportDTO report = reportService.generateDailyReport(today);
        return ResponseEntity.ok(report);
    }

    /**
     * Get session summary by ID
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<SessionSummaryDTO> getSessionSummary(@PathVariable Long sessionId) {
        log.info("Fetching session summary for session: {}", sessionId);

        SessionSummaryDTO summary = reportService.getSessionSummary(sessionId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get variance report for date range
     */
    @GetMapping("/variances")
    public ResponseEntity<List<VarianceReportDTO>> getVarianceReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Fetching variance report from {} to {}", startDate, endDate);

        List<VarianceReportDTO> report = reportService.getVarianceReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    /**
     * Get variances for today
     */
    @GetMapping("/variances/today")
    public ResponseEntity<List<VarianceReportDTO>> getTodayVariances() {
        LocalDate today = LocalDate.now();
        log.info("Fetching today's variances: {}", today);

        List<VarianceReportDTO> report = reportService.getVarianceReport(today, today);
        return ResponseEntity.ok(report);
    }

    /**
     * Get cash flow analysis for date range
     */
    @GetMapping("/cash-flow")
    public ResponseEntity<CashFlowReportDTO> getCashFlowAnalysis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Fetching cash flow analysis from {} to {}", startDate, endDate);

        CashFlowReportDTO report = reportService.getCashFlowAnalysis(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    /**
     * Get cash flow for current week
     */
    @GetMapping("/cash-flow/week")
    public ResponseEntity<CashFlowReportDTO> getWeeklyCashFlow() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        log.info("Fetching weekly cash flow from {} to {}", startOfWeek, endOfWeek);

        CashFlowReportDTO report = reportService.getCashFlowAnalysis(startOfWeek, endOfWeek);
        return ResponseEntity.ok(report);
    }

    /**
     * Get cash flow for current month
     */
    @GetMapping("/cash-flow/month")
    public ResponseEntity<CashFlowReportDTO> getMonthlyCashFlow() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        log.info("Fetching monthly cash flow from {} to {}", startOfMonth, endOfMonth);

        CashFlowReportDTO report = reportService.getCashFlowAnalysis(startOfMonth, endOfMonth);
        return ResponseEntity.ok(report);
    }
}
