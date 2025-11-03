package com.garbaking.operationsservice.dto;

import com.garbaking.operationsservice.model.ReservationStatus;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class ReservationStatusUpdateRequest {

    @NotNull
    private ReservationStatus status;
}
