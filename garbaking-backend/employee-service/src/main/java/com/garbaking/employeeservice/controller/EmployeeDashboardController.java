package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.EmployeeDashboardDTO;
import com.garbaking.employeeservice.service.EmployeeDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Employee Dashboard
 */
@RestController
@RequestMapping("/api/employees/dashboard")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class EmployeeDashboardController {

    private final EmployeeDashboardService dashboardService;

    @GetMapping
    public ResponseEntity<EmployeeDashboardDTO> getDashboard() {
        log.info("GET /api/employees/dashboard");
        EmployeeDashboardDTO dashboard = dashboardService.getDashboardData();
        return ResponseEntity.ok(dashboard);
    }
}
