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
public class PrinterJob {

    private Long id;
    private Long printerId;
    private String payloadType;
    private String referenceId;
    private PrinterJobStatus status;
    private Instant enqueuedAt;
    private Instant completedAt;
}
