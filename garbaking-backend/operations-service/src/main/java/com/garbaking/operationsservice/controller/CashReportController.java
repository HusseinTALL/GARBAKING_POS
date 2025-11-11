package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.report.*;
import com.garbaking.operationsservice.service.CashFlowForecastService;
import com.garbaking.operationsservice.service.CashReportService;
import com.garbaking.operationsservice.service.PDFExportService;
import com.garbaking.operationsservice.service.ExcelExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
    private final CashFlowForecastService forecastService;
    private final PDFExportService pdfExportService;
    private final ExcelExportService excelExportService;

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

    /**
     * Get cash flow forecast
     */
    @GetMapping("/forecast")
    public ResponseEntity<CashFlowForecastService.CashFlowForecast> getForecast(
            @RequestParam(defaultValue = "7") int daysAhead,
            @RequestParam(defaultValue = "30") int historicalDays) {
        log.info("Fetching cash flow forecast for {} days ahead based on {} historical days",
                daysAhead, historicalDays);

        CashFlowForecastService.CashFlowForecast forecast =
                forecastService.generateForecast(daysAhead, historicalDays);
        return ResponseEntity.ok(forecast);
    }

    // ==================== PDF Export Endpoints ====================

    /**
     * Export daily report to PDF
     */
    @GetMapping("/export/daily/pdf")
    public ResponseEntity<byte[]> exportDailyReportToPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Exporting daily report to PDF for date: {}", date);

        byte[] pdfBytes = pdfExportService.exportDailyReportToPDF(date);

        String filename = String.format("daily-cash-report_%s.pdf",
                date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    /**
     * Export variance report to PDF
     */
    @GetMapping("/export/variances/pdf")
    public ResponseEntity<byte[]> exportVarianceReportToPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Exporting variance report to PDF from {} to {}", startDate, endDate);

        byte[] pdfBytes = pdfExportService.exportVarianceReportToPDF(startDate, endDate);

        String filename = String.format("variance-report_%s_to_%s.pdf",
                startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    // ==================== Excel Export Endpoints ====================

    /**
     * Export daily report to Excel
     */
    @GetMapping("/export/daily/excel")
    public ResponseEntity<byte[]> exportDailyReportToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Exporting daily report to Excel for date: {}", date);

        try {
            byte[] excelBytes = excelExportService.exportDailyReportToExcel(date);

            String filename = String.format("daily-cash-report_%s.xlsx",
                    date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelBytes);
        } catch (Exception e) {
            log.error("Failed to export daily report to Excel", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Export variance report to Excel
     */
    @GetMapping("/export/variances/excel")
    public ResponseEntity<byte[]> exportVarianceReportToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Exporting variance report to Excel from {} to {}", startDate, endDate);

        try {
            byte[] excelBytes = excelExportService.exportVarianceReportToExcel(startDate, endDate);

            String filename = String.format("variance-report_%s_to_%s.xlsx",
                    startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                    endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelBytes);
        } catch (Exception e) {
            log.error("Failed to export variance report to Excel", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Export forecast to Excel
     */
    @GetMapping("/export/forecast/excel")
    public ResponseEntity<byte[]> exportForecastToExcel(
            @RequestParam(defaultValue = "7") int daysAhead,
            @RequestParam(defaultValue = "30") int historicalDays) {
        log.info("Exporting forecast to Excel for {} days ahead based on {} historical days",
                daysAhead, historicalDays);

        try {
            byte[] excelBytes = excelExportService.exportForecastToExcel(daysAhead, historicalDays);

            String filename = String.format("cash-flow-forecast_%ddays.xlsx", daysAhead);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelBytes);
        } catch (Exception e) {
            log.error("Failed to export forecast to Excel", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
