package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.CreateTimeOffRequest;
import com.garbaking.employeeservice.dto.ReviewTimeOffRequest;
import com.garbaking.employeeservice.dto.TimeOffRequestDTO;
import com.garbaking.employeeservice.model.Employee;
import com.garbaking.employeeservice.model.TimeOffRequest;
import com.garbaking.employeeservice.model.TimeOffRequestStatus;
import com.garbaking.employeeservice.repository.EmployeeRepository;
import com.garbaking.employeeservice.repository.TimeOffRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Time Off Request operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TimeOffRequestService {

    private final TimeOffRequestRepository timeOffRequestRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public TimeOffRequestDTO createTimeOffRequest(CreateTimeOffRequest request) {
        log.info("Creating time off request for employee ID: {}", request.getEmployeeId());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));

        // Validate dates
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Start date cannot be after end date");
        }

        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot request time off for past dates");
        }

        TimeOffRequest timeOffRequest = TimeOffRequest.builder()
                .employee(employee)
                .timeOffType(request.getTimeOffType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .status(TimeOffRequestStatus.PENDING)
                .build();

        timeOffRequest.calculateTotalDays();
        timeOffRequest = timeOffRequestRepository.save(timeOffRequest);

        log.info("Time off request created with ID: {}", timeOffRequest.getId());
        return convertToDTO(timeOffRequest);
    }

    @Transactional
    public TimeOffRequestDTO reviewTimeOffRequest(ReviewTimeOffRequest request) {
        log.info("Reviewing time off request ID: {} by reviewer: {}",
                request.getTimeOffRequestId(), request.getReviewerId());

        TimeOffRequest timeOffRequest = timeOffRequestRepository.findById(request.getTimeOffRequestId())
                .orElseThrow(() -> new RuntimeException("Time off request not found with id: " + request.getTimeOffRequestId()));

        if (!timeOffRequest.isPending()) {
            throw new RuntimeException("Time off request has already been reviewed");
        }

        if (request.getApproved()) {
            timeOffRequest.approve(request.getReviewerId(), request.getNotes());
            log.info("Time off request {} approved", timeOffRequest.getId());
        } else {
            timeOffRequest.reject(request.getReviewerId(), request.getNotes());
            log.info("Time off request {} rejected", timeOffRequest.getId());
        }

        timeOffRequest = timeOffRequestRepository.save(timeOffRequest);
        return convertToDTO(timeOffRequest);
    }

    @Transactional
    public void cancelTimeOffRequest(Long requestId, Long employeeId) {
        log.info("Cancelling time off request ID: {} by employee: {}", requestId, employeeId);

        TimeOffRequest timeOffRequest = timeOffRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Time off request not found with id: " + requestId));

        if (!timeOffRequest.getEmployee().getId().equals(employeeId)) {
            throw new RuntimeException("Employee can only cancel their own requests");
        }

        if (!timeOffRequest.canBeModified()) {
            throw new RuntimeException("Cannot cancel a request that has been reviewed");
        }

        timeOffRequest.cancel();
        timeOffRequestRepository.save(timeOffRequest);
        log.info("Time off request {} cancelled", requestId);
    }

    @Transactional(readOnly = true)
    public List<TimeOffRequestDTO> getTimeOffRequestsByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        return timeOffRequestRepository.findByEmployee(employee)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeOffRequestDTO> getPendingTimeOffRequests() {
        return timeOffRequestRepository.findAllPendingRequests()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeOffRequestDTO> getAllTimeOffRequests() {
        return timeOffRequestRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeOffRequestDTO> getApprovedRequestsOnDate(LocalDate date) {
        return timeOffRequestRepository.findAllApprovedOnDate(date)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TimeOffRequestDTO getTimeOffRequestById(Long id) {
        TimeOffRequest timeOffRequest = timeOffRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Time off request not found with id: " + id));
        return convertToDTO(timeOffRequest);
    }

    // Helper methods
    private TimeOffRequestDTO convertToDTO(TimeOffRequest request) {
        Employee reviewer = null;
        if (request.getReviewedBy() != null) {
            reviewer = employeeRepository.findById(request.getReviewedBy()).orElse(null);
        }

        return TimeOffRequestDTO.builder()
                .id(request.getId())
                .employeeId(request.getEmployee().getId())
                .employeeName(request.getEmployee().getFullName())
                .employeeNumber(request.getEmployee().getEmployeeNumber())
                .timeOffType(request.getTimeOffType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(request.getTotalDays())
                .reason(request.getReason())
                .status(request.getStatus())
                .reviewedBy(request.getReviewedBy())
                .reviewerName(reviewer != null ? reviewer.getFullName() : null)
                .reviewedAt(request.getReviewedAt())
                .reviewNotes(request.getReviewNotes())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .isActive(request.isActive())
                .isInFuture(request.isInFuture())
                .build();
    }
}
