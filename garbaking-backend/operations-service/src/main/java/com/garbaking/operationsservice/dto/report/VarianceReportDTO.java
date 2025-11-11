package com.garbaking.operationsservice.dto.report;

import com.garbaking.operationsservice.model.ReconciliationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Variance report showing cash discrepancies
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VarianceReportDTO {
    private Long sessionId;
    private Long reconciliationId;
    private LocalDate date;
    private LocalDateTime closedAt;

    private String drawerName;
    private String userName;

    private BigDecimal expectedCash;
    private BigDecimal countedCash;
    private BigDecimal variance;
    private ReconciliationStatus varianceStatus;

    private String reason;
    private String notes;
    private Boolean investigated;
    private Boolean resolved;

    // Calculated fields
    private BigDecimal variancePercentage;
    private String severityLevel; // LOW, MEDIUM, HIGH
}
