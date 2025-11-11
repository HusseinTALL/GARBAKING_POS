package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.*;
import com.garbaking.employeeservice.service.TimeEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for Time Entry operations
 */
@RestController
@RequestMapping("/api/employees/time-entries")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

    @PostMapping("/clock-in")
    public ResponseEntity<TimeEntryDTO> clockIn(@Valid @RequestBody ClockInRequest request) {
        log.info("POST /api/employees/time-entries/clock-in - Employee ID: {}", request.getEmployeeId());
        TimeEntryDTO timeEntry = timeEntryService.clockIn(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(timeEntry);
    }

    @PostMapping("/clock-out")
    public ResponseEntity<TimeEntryDTO> clockOut(@Valid @RequestBody ClockOutRequest request) {
        log.info("POST /api/employees/time-entries/clock-out - Employee ID: {}", request.getEmployeeId());
        TimeEntryDTO timeEntry = timeEntryService.clockOut(request);
        return ResponseEntity.ok(timeEntry);
    }

    @GetMapping("/active/{employeeId}")
    public ResponseEntity<TimeEntryDTO> getActiveTimeEntry(@PathVariable Long employeeId) {
        log.info("GET /api/employees/time-entries/active/{}", employeeId);
        TimeEntryDTO timeEntry = timeEntryService.getActiveTimeEntry(employeeId);
        if (timeEntry == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(timeEntry);
    }

    @GetMapping("/whos-working")
    public ResponseEntity<WhosWorkingDTO> getWhosWorking() {
        log.info("GET /api/employees/time-entries/whos-working");
        WhosWorkingDTO whosWorking = timeEntryService.getWhosWorking();
        return ResponseEntity.ok(whosWorking);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<TimeEntryDTO>> getTimeEntriesByEmployee(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        log.info("GET /api/employees/time-entries/employee/{} - Start: {}, End: {}",
                employeeId, startDate, endDate);
        List<TimeEntryDTO> timeEntries = timeEntryService.getTimeEntriesByEmployee(
                employeeId, startDate, endDate);
        return ResponseEntity.ok(timeEntries);
    }

    @GetMapping
    public ResponseEntity<List<TimeEntryDTO>> getAllTimeEntries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        log.info("GET /api/employees/time-entries - Start: {}, End: {}", startDate, endDate);
        List<TimeEntryDTO> timeEntries = timeEntryService.getAllTimeEntries(startDate, endDate);
        return ResponseEntity.ok(timeEntries);
    }

    @PostMapping("/{timeEntryId}/approve")
    public ResponseEntity<TimeEntryDTO> approveTimeEntry(
            @PathVariable Long timeEntryId,
            @RequestParam Long approverId
    ) {
        log.info("POST /api/employees/time-entries/{}/approve - Approver: {}", timeEntryId, approverId);
        TimeEntryDTO timeEntry = timeEntryService.approveTimeEntry(timeEntryId, approverId);
        return ResponseEntity.ok(timeEntry);
    }

    @DeleteMapping("/{timeEntryId}")
    public ResponseEntity<Void> deleteTimeEntry(@PathVariable Long timeEntryId) {
        log.info("DELETE /api/employees/time-entries/{}", timeEntryId);
        timeEntryService.deleteTimeEntry(timeEntryId);
        return ResponseEntity.noContent().build();
    }
}
