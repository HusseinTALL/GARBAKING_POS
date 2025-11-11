package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.*;
import com.garbaking.employeeservice.model.Employee;
import com.garbaking.employeeservice.model.TimeEntry;
import com.garbaking.employeeservice.model.TimeEntryStatus;
import com.garbaking.employeeservice.repository.EmployeeRepository;
import com.garbaking.employeeservice.repository.TimeEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for Time Entry operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public TimeEntryDTO clockIn(ClockInRequest request) {
        log.info("Clock in request for employee ID: {}", request.getEmployeeId());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));

        // Check if employee already has active time entry
        Optional<TimeEntry> activeEntry = timeEntryRepository.findActiveTimeEntry(employee);
        if (activeEntry.isPresent()) {
            throw new RuntimeException("Employee is already clocked in");
        }

        LocalDateTime clockInTime = request.getClockInTime() != null
                ? request.getClockInTime()
                : LocalDateTime.now();

        TimeEntry timeEntry = TimeEntry.builder()
                .employee(employee)
                .clockInTime(clockInTime)
                .location(request.getLocation())
                .notes(request.getNotes())
                .status(TimeEntryStatus.ACTIVE)
                .breakMinutes(0)
                .build();

        timeEntry = timeEntryRepository.save(timeEntry);
        log.info("Employee {} clocked in at {}", employee.getEmployeeNumber(), clockInTime);

        return convertToDTO(timeEntry);
    }

    @Transactional
    public TimeEntryDTO clockOut(ClockOutRequest request) {
        log.info("Clock out request for employee ID: {}", request.getEmployeeId());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));

        TimeEntry timeEntry = timeEntryRepository.findActiveTimeEntry(employee)
                .orElseThrow(() -> new RuntimeException("No active time entry found for employee"));

        LocalDateTime clockOutTime = request.getClockOutTime() != null
                ? request.getClockOutTime()
                : LocalDateTime.now();

        if (request.getBreakMinutes() != null) {
            timeEntry.setBreakMinutes(request.getBreakMinutes());
        }

        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            String existingNotes = timeEntry.getNotes() != null ? timeEntry.getNotes() + "\n" : "";
            timeEntry.setNotes(existingNotes + request.getNotes());
        }

        timeEntry.clockOut(clockOutTime);
        timeEntry = timeEntryRepository.save(timeEntry);

        log.info("Employee {} clocked out at {} - Total hours: {}",
                employee.getEmployeeNumber(), clockOutTime, timeEntry.getTotalHours());

        return convertToDTO(timeEntry);
    }

    @Transactional(readOnly = true)
    public TimeEntryDTO getActiveTimeEntry(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        return timeEntryRepository.findActiveTimeEntry(employee)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public WhosWorkingDTO getWhosWorking() {
        List<TimeEntry> activeEntries = timeEntryRepository.findAllActiveClockedIn();

        List<WhosWorkingDTO.ActiveEmployeeDTO> activeEmployees = activeEntries.stream()
                .map(entry -> WhosWorkingDTO.ActiveEmployeeDTO.builder()
                        .employeeId(entry.getEmployee().getId())
                        .employeeName(entry.getEmployee().getFullName())
                        .employeeNumber(entry.getEmployee().getEmployeeNumber())
                        .positionTitle(entry.getEmployee().getPosition() != null
                                ? entry.getEmployee().getPosition().getTitle()
                                : null)
                        .departmentName(entry.getEmployee().getDepartment() != null
                                ? entry.getEmployee().getDepartment().getName()
                                : null)
                        .clockInTime(entry.getClockInTime())
                        .currentHours(entry.getCurrentHours())
                        .location(entry.getLocation())
                        .build())
                .collect(Collectors.toList());

        return WhosWorkingDTO.builder()
                .totalClockedIn(activeEmployees.size())
                .activeEmployees(activeEmployees)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TimeEntryDTO> getTimeEntriesByEmployee(Long employeeId, LocalDateTime startDate, LocalDateTime endDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        return timeEntryRepository.findByEmployeeBetweenDates(employee, startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeEntryDTO> getAllTimeEntries(LocalDateTime startDate, LocalDateTime endDate) {
        return timeEntryRepository.findAllBetweenDates(startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TimeEntryDTO approveTimeEntry(Long timeEntryId, Long approverId) {
        log.info("Approving time entry ID: {} by approver: {}", timeEntryId, approverId);

        TimeEntry timeEntry = timeEntryRepository.findById(timeEntryId)
                .orElseThrow(() -> new RuntimeException("Time entry not found with id: " + timeEntryId));

        timeEntry.setStatus(TimeEntryStatus.APPROVED);
        timeEntry.setApprovedBy(approverId);
        timeEntry.setApprovedAt(LocalDateTime.now());

        timeEntry = timeEntryRepository.save(timeEntry);
        log.info("Time entry {} approved", timeEntryId);

        return convertToDTO(timeEntry);
    }

    @Transactional
    public void deleteTimeEntry(Long timeEntryId) {
        log.info("Deleting time entry ID: {}", timeEntryId);
        TimeEntry timeEntry = timeEntryRepository.findById(timeEntryId)
                .orElseThrow(() -> new RuntimeException("Time entry not found with id: " + timeEntryId));

        timeEntryRepository.delete(timeEntry);
        log.info("Time entry {} deleted", timeEntryId);
    }

    // Helper methods
    private TimeEntryDTO convertToDTO(TimeEntry timeEntry) {
        return TimeEntryDTO.builder()
                .id(timeEntry.getId())
                .employeeId(timeEntry.getEmployee().getId())
                .employeeName(timeEntry.getEmployee().getFullName())
                .employeeNumber(timeEntry.getEmployee().getEmployeeNumber())
                .clockInTime(timeEntry.getClockInTime())
                .clockOutTime(timeEntry.getClockOutTime())
                .breakMinutes(timeEntry.getBreakMinutes())
                .totalHours(timeEntry.getTotalHours())
                .overtimeHours(timeEntry.getOvertimeHours())
                .location(timeEntry.getLocation())
                .ipAddress(timeEntry.getIpAddress())
                .notes(timeEntry.getNotes())
                .status(timeEntry.getStatus())
                .approvedBy(timeEntry.getApprovedBy())
                .approvedAt(timeEntry.getApprovedAt())
                .createdAt(timeEntry.getCreatedAt())
                .updatedAt(timeEntry.getUpdatedAt())
                .isActive(timeEntry.isActive())
                .currentHours(timeEntry.getCurrentHours())
                .build();
    }
}
