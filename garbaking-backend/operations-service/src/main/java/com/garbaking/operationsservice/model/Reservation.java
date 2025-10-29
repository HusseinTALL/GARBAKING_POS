package com.garbaking.operationsservice.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    private Long id;
    private Long tableId;
    private String customerName;
    private String contact;
    private Instant startTime;
    private Instant endTime;
    private int partySize;
    private ReservationStatus status;
}
