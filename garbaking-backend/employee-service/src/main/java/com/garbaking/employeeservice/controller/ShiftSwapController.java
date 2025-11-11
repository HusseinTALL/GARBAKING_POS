package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.ApproveShiftSwapRequest;
import com.garbaking.employeeservice.dto.CreateShiftSwapRequest;
import com.garbaking.employeeservice.dto.RespondToShiftSwapRequest;
import com.garbaking.employeeservice.dto.ShiftSwapRequestDTO;
import com.garbaking.employeeservice.service.ShiftSwapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Shift Swap Request operations
 */
@RestController
@RequestMapping("/api/employees/shift-swaps")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class ShiftSwapController {

    private final ShiftSwapService shiftSwapService;

    @PostMapping
    public ResponseEntity<ShiftSwapRequestDTO> createShiftSwapRequest(
            @Valid @RequestBody CreateShiftSwapRequest request
    ) {
        log.info("POST /api/employees/shift-swaps - Requester: {}, Shift: {}",
                request.getRequesterId(), request.getRequesterShiftId());
        ShiftSwapRequestDTO swapRequest = shiftSwapService.createShiftSwapRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(swapRequest);
    }

    @PostMapping("/respond")
    public ResponseEntity<ShiftSwapRequestDTO> respondToShiftSwapRequest(
            @Valid @RequestBody RespondToShiftSwapRequest request
    ) {
        log.info("POST /api/employees/shift-swaps/respond - Request: {}, Employee: {}, Accept: {}",
                request.getSwapRequestId(), request.getEmployeeId(), request.getAccept());
        ShiftSwapRequestDTO swapRequest = shiftSwapService.respondToShiftSwapRequest(request);
        return ResponseEntity.ok(swapRequest);
    }

    @PostMapping("/approve")
    public ResponseEntity<ShiftSwapRequestDTO> approveShiftSwap(
            @Valid @RequestBody ApproveShiftSwapRequest request
    ) {
        log.info("POST /api/employees/shift-swaps/approve - Request: {}, Manager: {}",
                request.getSwapRequestId(), request.getManagerId());
        ShiftSwapRequestDTO swapRequest = shiftSwapService.approveShiftSwap(request);
        return ResponseEntity.ok(swapRequest);
    }

    @DeleteMapping("/{swapRequestId}/cancel")
    public ResponseEntity<ShiftSwapRequestDTO> cancelShiftSwapRequest(
            @PathVariable Long swapRequestId,
            @RequestParam Long employeeId
    ) {
        log.info("DELETE /api/employees/shift-swaps/{}/cancel - Employee: {}", swapRequestId, employeeId);
        ShiftSwapRequestDTO swapRequest = shiftSwapService.cancelShiftSwapRequest(swapRequestId, employeeId);
        return ResponseEntity.ok(swapRequest);
    }

    @GetMapping("/{swapRequestId}")
    public ResponseEntity<ShiftSwapRequestDTO> getShiftSwapRequestById(
            @PathVariable Long swapRequestId
    ) {
        log.info("GET /api/employees/shift-swaps/{}", swapRequestId);
        ShiftSwapRequestDTO swapRequest = shiftSwapService.getShiftSwapRequestById(swapRequestId);
        return ResponseEntity.ok(swapRequest);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ShiftSwapRequestDTO>> getSwapRequestsByEmployee(
            @PathVariable Long employeeId
    ) {
        log.info("GET /api/employees/shift-swaps/employee/{}", employeeId);
        List<ShiftSwapRequestDTO> swapRequests = shiftSwapService.getSwapRequestsByEmployee(employeeId);
        return ResponseEntity.ok(swapRequests);
    }

    @GetMapping("/employee/{employeeId}/pending")
    public ResponseEntity<List<ShiftSwapRequestDTO>> getPendingSwapRequestsForEmployee(
            @PathVariable Long employeeId
    ) {
        log.info("GET /api/employees/shift-swaps/employee/{}/pending", employeeId);
        List<ShiftSwapRequestDTO> swapRequests = shiftSwapService.getPendingSwapRequestsForEmployee(employeeId);
        return ResponseEntity.ok(swapRequests);
    }

    @GetMapping("/awaiting-approval")
    public ResponseEntity<List<ShiftSwapRequestDTO>> getSwapRequestsAwaitingApproval() {
        log.info("GET /api/employees/shift-swaps/awaiting-approval");
        List<ShiftSwapRequestDTO> swapRequests = shiftSwapService.getSwapRequestsAwaitingApproval();
        return ResponseEntity.ok(swapRequests);
    }

    @GetMapping
    public ResponseEntity<List<ShiftSwapRequestDTO>> getAllSwapRequests() {
        log.info("GET /api/employees/shift-swaps");
        List<ShiftSwapRequestDTO> swapRequests = shiftSwapService.getAllSwapRequests();
        return ResponseEntity.ok(swapRequests);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ShiftSwapRequestDTO>> getRecentSwapRequests() {
        log.info("GET /api/employees/shift-swaps/recent");
        List<ShiftSwapRequestDTO> swapRequests = shiftSwapService.getRecentSwapRequests();
        return ResponseEntity.ok(swapRequests);
    }
}
