package com.garbaking.operationsservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Printer Job Entity
 *
 * Represents a print job in the queue
 */
@Entity
@Table(name = "printer_jobs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrinterJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Printer that will process this job
     */
    @Column(nullable = false)
    private Long printerId;

    /**
     * Receipt ID to print
     */
    @Column(nullable = false)
    private Long receiptId;

    /**
     * Payload type (RECEIPT, KITCHEN_ORDER, BAR_ORDER, etc.)
     */
    private String payloadType;

    /**
     * Reference ID (order ID, transaction ID, etc.)
     */
    private String referenceId;

    /**
     * Job status
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrinterJobStatus status;

    /**
     * When job was created
     */
    @Column(nullable = false)
    private Instant enqueuedAt;

    /**
     * When printing started
     */
    private Instant startedAt;

    /**
     * When printing completed
     */
    private Instant completedAt;

    /**
     * Number of print attempts
     */
    @Builder.Default
    private Integer attempts = 0;

    /**
     * Error message if failed
     */
    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    /**
     * Priority (higher = more urgent)
     */
    @Builder.Default
    private Integer priority = 5;

    @PrePersist
    protected void onCreate() {
        if (enqueuedAt == null) {
            enqueuedAt = Instant.now();
        }
        if (status == null) {
            status = PrinterJobStatus.QUEUED;
        }
    }
}
