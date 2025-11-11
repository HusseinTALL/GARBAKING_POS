package com.garbaking.operationsservice.dto.report;

import com.garbaking.operationsservice.model.AlertSeverity;
import com.garbaking.operationsservice.model.ReconciliationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Alert for significant cash variances
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VarianceAlertDTO {
    private Long alertId;
    private Long sessionId;
    private Long reconciliationId;

    private AlertSeverity severity;
    private ReconciliationStatus varianceStatus;

    private String drawerName;
    private String userName;

    private BigDecimal variance;
    private BigDecimal variancePercentage;
    private BigDecimal threshold;

    private String message;
    private String reason;

    private LocalDateTime createdAt;
    private Boolean acknowledged;
    private LocalDateTime acknowledgedAt;
    private Long acknowledgedBy;
    private String acknowledgedByName;

    private Boolean resolved;
    private LocalDateTime resolvedAt;
    private Long resolvedBy;
    private String resolutionNotes;
}
