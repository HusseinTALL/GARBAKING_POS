package com.garbaking.operationsservice.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Cash flow analysis over a date range
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowReportDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;

    // Opening and closing balances
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private BigDecimal netChange;

    // Cash inflows
    private BigDecimal totalInflows;
    private BigDecimal salesInflow;
    private BigDecimal otherInflows;

    // Cash outflows
    private BigDecimal totalOutflows;
    private BigDecimal refundsOutflow;
    private BigDecimal dropsOutflow;
    private BigDecimal payoutsOutflow;

    // Daily breakdown
    private List<DailyCashFlowDTO> dailyBreakdown;

    // Statistics
    private BigDecimal averageDailySales;
    private BigDecimal averageDailyDrops;
    private BigDecimal peakSalesDay;
    private LocalDate peakSalesDate;
}
