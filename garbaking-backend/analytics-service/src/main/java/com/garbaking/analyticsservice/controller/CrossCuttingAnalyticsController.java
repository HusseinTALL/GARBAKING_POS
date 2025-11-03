package com.garbaking.analyticsservice.controller;

import com.garbaking.analyticsservice.dto.AnalyticsSnapshot;
import com.garbaking.analyticsservice.dto.CreateReportScheduleRequest;
import com.garbaking.analyticsservice.dto.ReportExportRequest;
import com.garbaking.analyticsservice.dto.ReportExportResponse;
import com.garbaking.analyticsservice.dto.ReportSchedule;
import com.garbaking.analyticsservice.service.CrossCuttingAnalyticsService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics/cross-cutting")
public class CrossCuttingAnalyticsController {

    private final CrossCuttingAnalyticsService analyticsService;

    public CrossCuttingAnalyticsController(CrossCuttingAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public AnalyticsSnapshot getSnapshot() {
        return analyticsService.getSnapshot();
    }

    @PostMapping("/refresh")
    public AnalyticsSnapshot refreshSnapshot() {
        return analyticsService.refreshSnapshot();
    }

    @PostMapping("/reports/export")
    public ReportExportResponse exportReport(@Valid @RequestBody ReportExportRequest request) {
        return analyticsService.exportReport(request);
    }

    @GetMapping("/reports/schedules")
    public List<ReportSchedule> listSchedules() {
        return analyticsService.listSchedules();
    }

    @PostMapping("/reports/schedules")
    @ResponseStatus(HttpStatus.CREATED)
    public ReportSchedule createSchedule(@Valid @RequestBody CreateReportScheduleRequest request) {
        return analyticsService.createSchedule(request);
    }

    @DeleteMapping("/reports/schedules/{scheduleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSchedule(@PathVariable Long scheduleId) {
        analyticsService.removeSchedule(scheduleId);
    }
}
