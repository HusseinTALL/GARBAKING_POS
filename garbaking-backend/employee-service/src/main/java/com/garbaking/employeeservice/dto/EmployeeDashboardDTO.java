package com.garbaking.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for Employee Dashboard statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDashboardDTO {
    private Long totalEmployees;
    private Long activeEmployees;
    private Long onLeaveEmployees;
    private Long totalDepartments;
    private Long totalPositions;
    private Long documentsExpiringSoon; // Documents expiring in 30 days
    private Long documentsExpired;

    // Department breakdown
    private Map<String, Long> employeesByDepartment;

    // Position breakdown
    private Map<String, Long> employeesByPosition;

    // Recent hires (last 30 days)
    private List<EmployeeSummaryDTO> recentHires;

    // Employees with documents expiring soon
    private List<EmployeeSummaryDTO> documentsExpiringAlert;
}
