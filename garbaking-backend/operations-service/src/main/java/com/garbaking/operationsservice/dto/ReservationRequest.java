package com.garbaking.operationsservice.dto;

import java.time.Instant;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class ReservationRequest {

    @NotNull
    private Long tableId;

    @NotBlank
    private String customerName;

    @NotBlank
    private String contact;

    @NotNull
    @FutureOrPresent
    private Instant startTime;

    @NotNull
    @FutureOrPresent
    private Instant endTime;

    @Min(1)
    private int partySize;
}
