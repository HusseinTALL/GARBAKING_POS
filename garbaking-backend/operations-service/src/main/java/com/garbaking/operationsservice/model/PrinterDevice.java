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
public class PrinterDevice {

    private Long id;
    private String name;
    private String location;
    private PrinterStatus status;
    private Instant lastHeartbeat;
}
