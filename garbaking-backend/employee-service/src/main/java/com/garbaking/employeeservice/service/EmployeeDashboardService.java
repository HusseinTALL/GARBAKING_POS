package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.EmployeeDashboardDTO;
import com.garbaking.employeeservice.dto.EmployeeSummaryDTO;
import com.garbaking.employeeservice.model.Employee;
import com.garbaking.employeeservice.model.EmployeeDocument;
import com.garbaking.employeeservice.model.EmployeeStatus;
import com.garbaking.employeeservice.repository.DepartmentRepository;
import com.garbaking.employeeservice.repository.EmployeeDocumentRepository;
import com.garbaking.employeeservice.repository.EmployeeRepository;
import com.garbaking.employeeservice.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Employee Dashboard statistics
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmployeeDashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final EmployeeDocumentRepository documentRepository;

    @Transactional(readOnly = true)
    public EmployeeDashboardDTO getDashboardData() {
        log.info("Generating employee dashboard data");

        List<Employee> allEmployees = employeeRepository.findAll();

        long totalEmployees = allEmployees.size();
        long activeEmployees = allEmployees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .count();
        long onLeaveEmployees = allEmployees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ON_LEAVE)
                .count();

        long totalDepartments = departmentRepository.count();
        long totalPositions = positionRepository.count();

        // Document alerts
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysFromNow = today.plusDays(30);

        List<EmployeeDocument> expiredDocs = documentRepository.findExpiredDocuments(today);
        List<EmployeeDocument> expiringSoonDocs = documentRepository.findDocumentsExpiringBetween(today, thirtyDaysFromNow);

        // Employee breakdown by department
        Map<String, Long> employeesByDepartment = allEmployees.stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getDepartment().getName(),
                        Collectors.counting()
                ));

        // Employee breakdown by position
        Map<String, Long> employeesByPosition = allEmployees.stream()
                .filter(e -> e.getPosition() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getPosition().getTitle(),
                        Collectors.counting()
                ));

        // Recent hires (last 30 days)
        LocalDate thirtyDaysAgo = today.minusDays(30);
        List<EmployeeSummaryDTO> recentHires = allEmployees.stream()
                .filter(e -> e.getHireDate() != null && e.getHireDate().isAfter(thirtyDaysAgo))
                .sorted(Comparator.comparing(Employee::getHireDate).reversed())
                .limit(5)
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());

        // Employees with expiring documents
        Set<Long> employeeIdsWithExpiringDocs = expiringSoonDocs.stream()
                .map(doc -> doc.getEmployee().getId())
                .collect(Collectors.toSet());

        List<EmployeeSummaryDTO> documentsExpiringAlert = employeeIdsWithExpiringDocs.stream()
                .limit(5)
                .map(id -> employeeRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());

        return EmployeeDashboardDTO.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .onLeaveEmployees(onLeaveEmployees)
                .totalDepartments(totalDepartments)
                .totalPositions(totalPositions)
                .documentsExpiringSoon((long) expiringSoonDocs.size())
                .documentsExpired((long) expiredDocs.size())
                .employeesByDepartment(employeesByDepartment)
                .employeesByPosition(employeesByPosition)
                .recentHires(recentHires)
                .documentsExpiringAlert(documentsExpiringAlert)
                .build();
    }

    private EmployeeSummaryDTO convertToSummaryDTO(Employee employee) {
        return EmployeeSummaryDTO.builder()
                .id(employee.getId())
                .employeeNumber(employee.getEmployeeNumber())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .positionTitle(employee.getPosition() != null ? employee.getPosition().getTitle() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .status(employee.getStatus())
                .hireDate(employee.getHireDate())
                .profilePictureUrl(employee.getProfilePictureUrl())
                .build();
    }
}
