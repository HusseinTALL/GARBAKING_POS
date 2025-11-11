package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.CreateTimeOffRequest;
import com.garbaking.employeeservice.dto.ReviewTimeOffRequest;
import com.garbaking.employeeservice.dto.TimeOffRequestDTO;
import com.garbaking.employeeservice.service.TimeOffRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Time Off Request operations
 */
@RestController
@RequestMapping("/api/employees/time-off")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class TimeOffRequestController {

    private final TimeOffRequestService timeOffRequestService;

    @PostMapping
    public ResponseEntity<TimeOffRequestDTO> createTimeOffRequest(
            @Valid @RequestBody CreateTimeOffRequest request
    ) {
        log.info("POST /api/employees/time-off - Employee ID: {}", request.getEmployeeId());
        TimeOffRequestDTO timeOffRequest = timeOffRequestService.createTimeOffRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(timeOffRequest);
    }

    @PostMapping("/review")
    public ResponseEntity<TimeOffRequestDTO> reviewTimeOffRequest(
            @Valid @RequestBody ReviewTimeOffRequest request
    ) {
        log.info("POST /api/employees/time-off/review - Request ID: {}, Reviewer: {}",
                request.getTimeOffRequestId(), request.getReviewerId());
        TimeOffRequestDTO timeOffRequest = timeOffRequestService.reviewTimeOffRequest(request);
        return ResponseEntity.ok(timeOffRequest);
    }

    @DeleteMapping("/{requestId}/cancel")
    public ResponseEntity<Void> cancelTimeOffRequest(
            @PathVariable Long requestId,
            @RequestParam Long employeeId
    ) {
        log.info("DELETE /api/employees/time-off/{}/cancel - Employee: {}", requestId, employeeId);
        timeOffRequestService.cancelTimeOffRequest(requestId, employeeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<TimeOffRequestDTO>> getTimeOffRequestsByEmployee(
            @PathVariable Long employeeId
    ) {
        log.info("GET /api/employees/time-off/employee/{}", employeeId);
        List<TimeOffRequestDTO> requests = timeOffRequestService.getTimeOffRequestsByEmployee(employeeId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TimeOffRequestDTO>> getPendingTimeOffRequests() {
        log.info("GET /api/employees/time-off/pending");
        List<TimeOffRequestDTO> requests = timeOffRequestService.getPendingTimeOffRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping
    public ResponseEntity<List<TimeOffRequestDTO>> getAllTimeOffRequests() {
        log.info("GET /api/employees/time-off");
        List<TimeOffRequestDTO> requests = timeOffRequestService.getAllTimeOffRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/on-date")
    public ResponseEntity<List<TimeOffRequestDTO>> getApprovedRequestsOnDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        log.info("GET /api/employees/time-off/on-date - Date: {}", date);
        List<TimeOffRequestDTO> requests = timeOffRequestService.getApprovedRequestsOnDate(date);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimeOffRequestDTO> getTimeOffRequestById(@PathVariable Long id) {
        log.info("GET /api/employees/time-off/{}", id);
        TimeOffRequestDTO request = timeOffRequestService.getTimeOffRequestById(id);
        return ResponseEntity.ok(request);
    }
}
