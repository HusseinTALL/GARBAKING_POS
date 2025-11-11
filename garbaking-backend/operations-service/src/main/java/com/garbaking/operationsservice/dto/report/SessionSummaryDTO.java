package com.garbaking.operationsservice.dto.report;

import com.garbaking.operationsservice.model.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Summary information for a single cash drawer session
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionSummaryDTO {
    private Long sessionId;
    private Long drawerId;
    private String drawerName;
    private Long userId;
    private String userName;
    private SessionStatus status;

    // Timing
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private Long durationMinutes;

    // Cash amounts
    private BigDecimal startingCash;
    private BigDecimal expectedCash;
    private BigDecimal countedCash;
    private BigDecimal variance;
    private String varianceStatus;

    // Transaction counts
    private Integer totalTransactions;
    private Integer saleCount;
    private Integer refundCount;
    private Integer dropCount;
    private Integer payoutCount;
    private Integer noSaleCount;

    // Transaction amounts
    private BigDecimal totalSales;
    private BigDecimal totalRefunds;
    private BigDecimal totalDrops;
    private BigDecimal totalPayouts;

    // Reconciliation
    private String reconciliationNotes;
    private Boolean hasLargeVariance;
}
