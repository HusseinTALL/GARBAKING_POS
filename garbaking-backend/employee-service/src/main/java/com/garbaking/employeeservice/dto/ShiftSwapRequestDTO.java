package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.ShiftSwapStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Shift Swap Request information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftSwapRequestDTO {

    private Long id;

    // Requester information
    private Long requesterId;
    private String requesterName;
    private String requesterEmployeeNumber;

    // Requester shift
    private Long requesterShiftId;
    private ShiftDTO requesterShift;

    // Target employee information (optional - can be open request)
    private Long targetEmployeeId;
    private String targetEmployeeName;
    private String targetEmployeeNumber;

    // Target shift (optional)
    private Long targetShiftId;
    private ShiftDTO targetShift;

    // Request details
    private ShiftSwapStatus status;
    private String requestMessage;

    // Response details
    private LocalDateTime respondedAt;
    private String responseMessage;

    // Approval details
    private Long approvedBy;
    private String approverName;
    private LocalDateTime approvedAt;
    private String approvalNotes;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
