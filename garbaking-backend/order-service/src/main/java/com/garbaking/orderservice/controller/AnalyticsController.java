package com.garbaking.orderservice.controller;

import com.garbaking.orderservice.dto.analytics.*;
import com.garbaking.orderservice.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public DashboardAnalytics getDashboardStats() {
        return analyticsService.getDashboardAnalytics();
    }

    @GetMapping("/sales")
    public SalesData getSalesData(@RequestParam(required = false) String startDate,
                                  @RequestParam(required = false) String endDate) {
        LocalDateTime end = Optional.ofNullable(endDate)
                .map(LocalDate::parse)
                .map(date -> date.atTime(23, 59, 59))
                .orElse(LocalDateTime.now());
        LocalDateTime start = Optional.ofNullable(startDate)
                .map(LocalDate::parse)
                .map(LocalDate::atStartOfDay)
                .orElse(end.minusDays(30));
        return analyticsService.getSalesData(start, end);
    }

    @GetMapping("/menu-performance")
    public MenuPerformanceResponse getMenuPerformance(@RequestParam(defaultValue = "30") int days) {
        return analyticsService.getMenuPerformance(days);
    }

    @GetMapping("/peak-hours")
    public PeakHoursResponse getPeakHours(@RequestParam(defaultValue = "7") int days) {
        return analyticsService.getPeakHours(days);
    }

    @GetMapping("/payment-methods")
    public PaymentMethodAnalytics getPaymentMethods(@RequestParam(defaultValue = "30") int days) {
        return analyticsService.getPaymentMethods(days);
    }

    @GetMapping("/customer-insights")
    public CustomerInsightsResponse getCustomerInsights(@RequestParam(defaultValue = "30") int days) {
        return analyticsService.getCustomerInsights(days);
    }

    @GetMapping("/products")
    public ProductAnalyticsResponse getProductAnalytics(@RequestParam(defaultValue = "month") String period) {
        return analyticsService.getProductAnalytics(period);
    }

    @GetMapping("/categories")
    public CategoryAnalyticsResponse getCategoryAnalytics(@RequestParam(defaultValue = "month") String period) {
        return analyticsService.getCategoryAnalytics(period);
    }

    @GetMapping("/staff")
    public StaffPerformanceResponse getStaffPerformance(@RequestParam(defaultValue = "month") String period) {
        return analyticsService.getStaffPerformance(period);
    }

    @GetMapping("/customers")
    public CustomerAnalyticsResponse getCustomerAnalytics(@RequestParam(defaultValue = "month") String period) {
        return analyticsService.getCustomerAnalytics(period);
    }

    @GetMapping("/time")
    public TimeAnalyticsResponse getTimeAnalytics(@RequestParam(defaultValue = "week") String period) {
        return analyticsService.getTimeAnalytics(period);
    }

    @GetMapping("/comparison")
    public ComparisonResponse getComparisonData(@RequestParam(defaultValue = "month") String period) {
        return analyticsService.getComparisonData(period);
    }

    @GetMapping("/inventory")
    public InventoryAnalyticsResponse getInventoryAnalytics() {
        return analyticsService.getInventoryAnalytics();
    }

    @PostMapping("/reports/generate")
    public GeneratedReportResponse generateReport(@RequestBody GenerateReportRequest request) {
        return analyticsService.generateReport(request);
    }

    @PostMapping("/reports/schedule")
    public ScheduledReportResponse scheduleReport(@RequestBody ScheduleReportRequest request) {
        return analyticsService.scheduleReport(request);
    }

    @GetMapping("/reports/configs")
    public ReportConfigListResponse getReportConfigs() {
        return analyticsService.getReportConfigs();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportData(@RequestParam(defaultValue = "sales") String type,
                                             @RequestParam(defaultValue = "CSV") String format,
                                             @RequestParam(defaultValue = "month") String period,
                                             @RequestParam(required = false) String startDate,
                                             @RequestParam(required = false) String endDate) {
        LocalDateTime start = Optional.ofNullable(startDate).map(LocalDate::parse).map(LocalDate::atStartOfDay).orElse(null);
        LocalDateTime end = Optional.ofNullable(endDate).map(LocalDate::parse).map(date -> date.atTime(23, 59, 59)).orElse(null);
        byte[] data = analyticsService.exportData(type, period, start, end);
        String filename = type + "-" + period + "." + format.toLowerCase();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @GetMapping("/comparison/yoy")
    public ComparisonResponse getYearOverYearComparison() {
        return analyticsService.getYearOverYearComparison();
    }

    @GetMapping("/comparison/mom")
    public ComparisonResponse getMonthOverMonthComparison() {
        return analyticsService.getMonthOverMonthComparison();
    }

    @GetMapping("/comparison/custom")
    public ComparisonResponse getCustomComparison(@RequestParam String startDate1,
                                                  @RequestParam String endDate1,
                                                  @RequestParam String startDate2,
                                                  @RequestParam String endDate2) {
        LocalDateTime start1 = LocalDate.parse(startDate1).atStartOfDay();
        LocalDateTime end1 = LocalDate.parse(endDate1).atTime(23, 59, 59);
        LocalDateTime start2 = LocalDate.parse(startDate2).atStartOfDay();
        LocalDateTime end2 = LocalDate.parse(endDate2).atTime(23, 59, 59);
        return analyticsService.getCustomComparison(start1, end1, start2, end2);
    }

    @GetMapping("/receipts/summary")
    public ReceiptSummaryResponse getReceiptSummary() {
        return analyticsService.getReceiptSummary();
    }

    @GetMapping("/printers/queue")
    public PrinterQueueResponse getPrinterQueue() {
        return analyticsService.getPrinterQueueStatus();
    }

    @GetMapping("/loyalty/hooks")
    public LoyaltyIntegrationResponse getLoyaltyIntegration() {
        return analyticsService.getLoyaltyIntegrationMetrics();
    }
}
