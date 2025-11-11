package com.garbaking.operationsservice.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Daily cash report showing all cash activity for a specific date
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyCashReportDTO {
    private LocalDate reportDate;
    private Integer totalSessions;
    private Integer openSessions;
    private Integer closedSessions;

    // Cash Summary
    private BigDecimal totalStartingCash;
    private BigDecimal totalEndingCash;
    private BigDecimal totalSales;
    private BigDecimal totalRefunds;
    private BigDecimal totalDrops;
    private BigDecimal totalPayouts;
    private BigDecimal netCashFlow;

    // Transaction Summary
    private Integer totalTransactionCount;
    private Integer saleCount;
    private Integer refundCount;
    private Integer dropCount;
    private Integer payoutCount;
    private Integer noSaleCount;

    // Variance Summary
    private BigDecimal totalVariance;
    private Integer balancedSessions;
    private Integer shortSessions;
    private Integer overSessions;
    private BigDecimal totalShortage;
    private BigDecimal totalOverage;

    // Session details
    private List<SessionSummaryDTO> sessions;
}
