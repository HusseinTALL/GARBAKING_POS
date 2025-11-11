package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.*;
import com.garbaking.employeeservice.model.*;
import com.garbaking.employeeservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Shift Swap Request operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ShiftSwapService {

    private final ShiftSwapRequestRepository shiftSwapRequestRepository;
    private final ShiftRepository shiftRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public ShiftSwapRequestDTO createShiftSwapRequest(CreateShiftSwapRequest request) {
        log.info("Creating shift swap request from employee {} for shift {}",
                request.getRequesterId(), request.getRequesterShiftId());

        // Validate requester exists
        Employee requester = employeeRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new RuntimeException("Requester not found with ID: " + request.getRequesterId()));

        // Validate requester shift exists
        Shift requesterShift = shiftRepository.findById(request.getRequesterShiftId())
                .orElseThrow(() -> new RuntimeException("Requester shift not found with ID: " + request.getRequesterShiftId()));

        // Validate requester owns the shift
        if (!requesterShift.getEmployee().getId().equals(request.getRequesterId())) {
            throw new RuntimeException("Requester does not own the shift");
        }

        // Validate shift is scheduled (can't swap completed/cancelled shifts)
        if (requesterShift.getStatus() != ShiftStatus.SCHEDULED) {
            throw new RuntimeException("Can only swap scheduled shifts. Current status: " + requesterShift.getStatus());
        }

        // Validate target employee if provided
        Employee targetEmployee = null;
        if (request.getTargetEmployeeId() != null) {
            targetEmployee = employeeRepository.findById(request.getTargetEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Target employee not found with ID: " + request.getTargetEmployeeId()));

            // Can't swap with yourself
            if (request.getTargetEmployeeId().equals(request.getRequesterId())) {
                throw new RuntimeException("Cannot swap shift with yourself");
            }
        }

        // Validate target shift if provided
        Shift targetShift = null;
        if (request.getTargetShiftId() != null) {
            targetShift = shiftRepository.findById(request.getTargetShiftId())
                    .orElseThrow(() -> new RuntimeException("Target shift not found with ID: " + request.getTargetShiftId()));

            // Validate target shift is scheduled
            if (targetShift.getStatus() != ShiftStatus.SCHEDULED) {
                throw new RuntimeException("Target shift must be scheduled. Current status: " + targetShift.getStatus());
            }

            // If target shift is provided, target employee must match
            if (targetEmployee != null && !targetShift.getEmployee().getId().equals(targetEmployee.getId())) {
                throw new RuntimeException("Target shift does not belong to target employee");
            }
        }

        // Create swap request
        ShiftSwapRequest swapRequest = ShiftSwapRequest.builder()
                .requester(requester)
                .requesterShift(requesterShift)
                .targetEmployee(targetEmployee)
                .targetShift(targetShift)
                .status(ShiftSwapStatus.PENDING)
                .requestMessage(request.getRequestMessage())
                .build();

        ShiftSwapRequest savedRequest = shiftSwapRequestRepository.save(swapRequest);
        log.info("Shift swap request created successfully with ID: {}", savedRequest.getId());

        return convertToDTO(savedRequest);
    }

    @Transactional
    public ShiftSwapRequestDTO respondToShiftSwapRequest(RespondToShiftSwapRequest request) {
        log.info("Employee {} responding to swap request {}", request.getEmployeeId(), request.getSwapRequestId());

        ShiftSwapRequest swapRequest = shiftSwapRequestRepository.findById(request.getSwapRequestId())
                .orElseThrow(() -> new RuntimeException("Swap request not found with ID: " + request.getSwapRequestId()));

        // Validate requester is not responding to their own request
        if (swapRequest.getRequester().getId().equals(request.getEmployeeId())) {
            throw new RuntimeException("Cannot respond to your own swap request");
        }

        // Validate request is still pending
        if (swapRequest.getStatus() != ShiftSwapStatus.PENDING) {
            throw new RuntimeException("Can only respond to pending requests. Current status: " + swapRequest.getStatus());
        }

        // Validate employee is the target (if target is specified)
        if (swapRequest.getTargetEmployee() != null &&
                !swapRequest.getTargetEmployee().getId().equals(request.getEmployeeId())) {
            throw new RuntimeException("You are not the target of this swap request");
        }

        // If this is an open request and target employee wasn't specified, set it now
        if (swapRequest.getTargetEmployee() == null) {
            Employee targetEmployee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + request.getEmployeeId()));
            swapRequest.setTargetEmployee(targetEmployee);
        }

        // Accept or reject
        if (request.getAccept()) {
            swapRequest.accept(request.getResponseMessage());
            log.info("Swap request accepted by employee {}", request.getEmployeeId());
        } else {
            swapRequest.reject(request.getResponseMessage());
            log.info("Swap request rejected by employee {}", request.getEmployeeId());
        }

        ShiftSwapRequest updatedRequest = shiftSwapRequestRepository.save(swapRequest);
        return convertToDTO(updatedRequest);
    }

    @Transactional
    public ShiftSwapRequestDTO approveShiftSwap(ApproveShiftSwapRequest request) {
        log.info("Manager {} approving swap request {}", request.getManagerId(), request.getSwapRequestId());

        ShiftSwapRequest swapRequest = shiftSwapRequestRepository.findById(request.getSwapRequestId())
                .orElseThrow(() -> new RuntimeException("Swap request not found with ID: " + request.getSwapRequestId()));

        // Validate request is accepted (not pending, rejected, or cancelled)
        if (swapRequest.getStatus() != ShiftSwapStatus.ACCEPTED) {
            throw new RuntimeException("Can only approve accepted requests. Current status: " + swapRequest.getStatus());
        }

        // Validate manager exists
        Employee manager = employeeRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager not found with ID: " + request.getManagerId()));

        // Approve and perform the swap
        swapRequest.approve(request.getManagerId(), request.getApprovalNotes());

        // Save the swapped shifts
        if (swapRequest.getTargetShift() != null) {
            shiftRepository.save(swapRequest.getRequesterShift());
            shiftRepository.save(swapRequest.getTargetShift());
        } else {
            // Just reassign requester's shift to target employee
            shiftRepository.save(swapRequest.getRequesterShift());
        }

        ShiftSwapRequest approvedRequest = shiftSwapRequestRepository.save(swapRequest);
        log.info("Swap request approved successfully by manager {}", request.getManagerId());

        return convertToDTO(approvedRequest);
    }

    @Transactional
    public ShiftSwapRequestDTO cancelShiftSwapRequest(Long swapRequestId, Long employeeId) {
        log.info("Employee {} cancelling swap request {}", employeeId, swapRequestId);

        ShiftSwapRequest swapRequest = shiftSwapRequestRepository.findById(swapRequestId)
                .orElseThrow(() -> new RuntimeException("Swap request not found with ID: " + swapRequestId));

        // Validate employee is the requester
        if (!swapRequest.getRequester().getId().equals(employeeId)) {
            throw new RuntimeException("Only the requester can cancel the swap request");
        }

        // Validate request can be cancelled
        if (!swapRequest.canBeCancelled()) {
            throw new RuntimeException("Cannot cancel request with status: " + swapRequest.getStatus());
        }

        swapRequest.cancel();
        ShiftSwapRequest cancelledRequest = shiftSwapRequestRepository.save(swapRequest);

        log.info("Swap request cancelled successfully");
        return convertToDTO(cancelledRequest);
    }

    @Transactional(readOnly = true)
    public ShiftSwapRequestDTO getShiftSwapRequestById(Long swapRequestId) {
        log.info("Getting swap request by ID: {}", swapRequestId);

        ShiftSwapRequest swapRequest = shiftSwapRequestRepository.findById(swapRequestId)
                .orElseThrow(() -> new RuntimeException("Swap request not found with ID: " + swapRequestId));

        return convertToDTO(swapRequest);
    }

    @Transactional(readOnly = true)
    public List<ShiftSwapRequestDTO> getSwapRequestsByEmployee(Long employeeId) {
        log.info("Getting swap requests for employee: {}", employeeId);

        List<ShiftSwapRequest> requests = shiftSwapRequestRepository.findByEmployeeInvolved(employeeId);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftSwapRequestDTO> getPendingSwapRequestsForEmployee(Long employeeId) {
        log.info("Getting pending swap requests for employee: {}", employeeId);

        List<ShiftSwapRequest> requests = shiftSwapRequestRepository.findPendingRequestsForEmployee(employeeId);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftSwapRequestDTO> getSwapRequestsAwaitingApproval() {
        log.info("Getting swap requests awaiting manager approval");

        List<ShiftSwapRequest> requests = shiftSwapRequestRepository.findAcceptedRequestsAwaitingApproval();
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftSwapRequestDTO> getAllSwapRequests() {
        log.info("Getting all swap requests");

        List<ShiftSwapRequest> requests = shiftSwapRequestRepository.findAll();
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftSwapRequestDTO> getRecentSwapRequests() {
        log.info("Getting recent swap requests (last 30 days)");

        List<ShiftSwapRequest> requests = shiftSwapRequestRepository.findRecentSwapRequests();
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ShiftSwapRequestDTO convertToDTO(ShiftSwapRequest request) {
        ShiftSwapRequestDTO dto = ShiftSwapRequestDTO.builder()
                .id(request.getId())
                .requesterId(request.getRequester().getId())
                .requesterName(request.getRequester().getFullName())
                .requesterEmployeeNumber(request.getRequester().getEmployeeNumber())
                .requesterShiftId(request.getRequesterShift().getId())
                .status(request.getStatus())
                .requestMessage(request.getRequestMessage())
                .respondedAt(request.getRespondedAt())
                .responseMessage(request.getResponseMessage())
                .approvedBy(request.getApprovedBy())
                .approvedAt(request.getApprovedAt())
                .approvalNotes(request.getApprovalNotes())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();

        // Add target employee info if present
        if (request.getTargetEmployee() != null) {
            dto.setTargetEmployeeId(request.getTargetEmployee().getId());
            dto.setTargetEmployeeName(request.getTargetEmployee().getFullName());
            dto.setTargetEmployeeNumber(request.getTargetEmployee().getEmployeeNumber());
        }

        // Add target shift info if present
        if (request.getTargetShift() != null) {
            dto.setTargetShiftId(request.getTargetShift().getId());
        }

        // Add approver name if approved
        if (request.getApprovedBy() != null) {
            employeeRepository.findById(request.getApprovedBy())
                    .ifPresent(approver -> dto.setApproverName(approver.getFullName()));
        }

        return dto;
    }
}
