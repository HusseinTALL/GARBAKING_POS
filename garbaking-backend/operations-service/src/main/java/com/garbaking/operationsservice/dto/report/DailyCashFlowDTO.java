package com.garbaking.operationsservice.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Daily cash flow summary
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyCashFlowDTO {
    private LocalDate date;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private BigDecimal sales;
    private BigDecimal refunds;
    private BigDecimal drops;
    private BigDecimal payouts;
    private BigDecimal netFlow;
    private Integer transactionCount;
}
