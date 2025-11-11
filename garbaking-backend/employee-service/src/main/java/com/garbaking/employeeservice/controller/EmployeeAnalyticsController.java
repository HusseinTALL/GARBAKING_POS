package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.EmployeeAnalyticsDTO;
import com.garbaking.employeeservice.service.EmployeeAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Employee Analytics
 * Provides aggregated metrics for performance, training, and certifications
 */
@RestController
@RequestMapping("/api/employees/analytics")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class EmployeeAnalyticsController {

    private final EmployeeAnalyticsService analyticsService;

    /**
     * Get comprehensive employee analytics
     * Includes performance metrics, training metrics, certification metrics, and employee stats
     *
     * @return Analytics dashboard data
     */
    @GetMapping
    public ResponseEntity<EmployeeAnalyticsDTO> getEmployeeAnalytics() {
        log.info("GET /api/employees/analytics - Fetching employee analytics");
        EmployeeAnalyticsDTO analytics = analyticsService.getEmployeeAnalytics();
        return ResponseEntity.ok(analytics);
    }
}
