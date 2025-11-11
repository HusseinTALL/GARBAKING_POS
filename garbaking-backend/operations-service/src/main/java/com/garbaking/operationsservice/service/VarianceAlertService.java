package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.report.VarianceAlertDTO;
import com.garbaking.operationsservice.model.*;
import com.garbaking.operationsservice.repository.VarianceAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing variance alerts
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class VarianceAlertService {

    private final VarianceAlertRepository alertRepository;

    // Configurable thresholds
    private static final BigDecimal LOW_THRESHOLD = BigDecimal.valueOf(10);
    private static final BigDecimal MEDIUM_THRESHOLD = BigDecimal.valueOf(50);
    private static final BigDecimal HIGH_THRESHOLD = BigDecimal.valueOf(100);
    private static final BigDecimal CRITICAL_THRESHOLD = BigDecimal.valueOf(500);

    private static final BigDecimal LOW_PERCENTAGE = BigDecimal.valueOf(2);
    private static final BigDecimal MEDIUM_PERCENTAGE = BigDecimal.valueOf(5);
    private static final BigDecimal HIGH_PERCENTAGE = BigDecimal.valueOf(10);

    /**
     * Generate alert for variance if it exceeds thresholds
     */
    @Transactional
    public VarianceAlert generateAlertIfNeeded(CashReconciliation reconciliation) {
        log.debug("Checking variance for alert generation: reconciliationId={}, variance={}",
                reconciliation.getId(), reconciliation.getVariance());

        BigDecimal variance = reconciliation.getVariance();
        BigDecimal absVariance = variance.abs();

        // Calculate variance percentage
        BigDecimal variancePercentage = BigDecimal.ZERO;
        if (reconciliation.getExpectedCash().compareTo(BigDecimal.ZERO) > 0) {
            variancePercentage = variance.abs()
                    .divide(reconciliation.getExpectedCash(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // Determine if alert is needed
        AlertSeverity severity = determineSeverity(absVariance, variancePercentage);

        if (severity == null) {
            log.debug("Variance within acceptable limits, no alert needed");
            return null;
        }

        // Create alert
        String message = buildAlertMessage(reconciliation, variance, variancePercentage, severity);

        CashDrawerSession session = reconciliation.getSession();

        VarianceAlert alert = VarianceAlert.builder()
                .session(session)
                .reconciliation(reconciliation)
                .severity(severity)
                .varianceStatus(reconciliation.getStatus())
                .variance(variance)
                .variancePercentage(variancePercentage)
                .threshold(getThresholdForSeverity(severity))
                .message(message)
                .reason(reconciliation.getVarianceReason())
                .createdAt(LocalDateTime.now())
                .acknowledged(false)
                .resolved(false)
                .build();

        alert = alertRepository.save(alert);
        log.info("Created variance alert: id={}, severity={}, variance={}",
                alert.getId(), severity, variance);

        return alert;
    }

    /**
     * Get all unresolved alerts
     */
    @Transactional(readOnly = true)
    public List<VarianceAlertDTO> getUnresolvedAlerts() {
        List<VarianceAlert> alerts = alertRepository.findByResolvedFalseOrderByCreatedAtDesc();
        return alerts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unacknowledged alerts
     */
    @Transactional(readOnly = true)
    public List<VarianceAlertDTO> getUnacknowledgedAlerts() {
        List<VarianceAlert> alerts = alertRepository.findByAcknowledgedFalseOrderByCreatedAtDesc();
        return alerts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get high priority unresolved alerts
     */
    @Transactional(readOnly = true)
    public List<VarianceAlertDTO> getHighPriorityAlerts() {
        List<VarianceAlert> alerts = alertRepository.findHighPriorityUnresolved();
        return alerts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts by severity
     */
    @Transactional(readOnly = true)
    public List<VarianceAlertDTO> getAlertsBySeverity(AlertSeverity severity) {
        List<VarianceAlert> alerts = alertRepository.findBySeverityOrderByCreatedAtDesc(severity);
        return alerts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts for date range
     */
    @Transactional(readOnly = true)
    public List<VarianceAlertDTO> getAlertsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<VarianceAlert> alerts = alertRepository.findByDateRange(startDate, endDate);
        return alerts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts for specific session
     */
    @Transactional(readOnly = true)
    public List<VarianceAlertDTO> getAlertsForSession(Long sessionId) {
        List<VarianceAlert> alerts = alertRepository.findBySessionIdOrderByCreatedAtDesc(sessionId);
        return alerts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Acknowledge an alert
     */
    @Transactional
    public VarianceAlertDTO acknowledgeAlert(Long alertId, Long userId) {
        VarianceAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));

        if (alert.getAcknowledged()) {
            log.warn("Alert {} already acknowledged", alertId);
            return toDTO(alert);
        }

        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedBy(userId);

        alert = alertRepository.save(alert);
        log.info("Alert {} acknowledged by user {}", alertId, userId);

        return toDTO(alert);
    }

    /**
     * Resolve an alert
     */
    @Transactional
    public VarianceAlertDTO resolveAlert(Long alertId, Long userId, String resolutionNotes) {
        VarianceAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));

        if (alert.getResolved()) {
            log.warn("Alert {} already resolved", alertId);
            return toDTO(alert);
        }

        alert.setResolved(true);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedBy(userId);
        alert.setResolutionNotes(resolutionNotes);

        // Auto-acknowledge if not already acknowledged
        if (!alert.getAcknowledged()) {
            alert.setAcknowledged(true);
            alert.setAcknowledgedAt(LocalDateTime.now());
            alert.setAcknowledgedBy(userId);
        }

        alert = alertRepository.save(alert);
        log.info("Alert {} resolved by user {}", alertId, userId);

        return toDTO(alert);
    }

    /**
     * Get alert statistics
     */
    @Transactional(readOnly = true)
    public AlertStatistics getAlertStatistics() {
        long unresolvedCount = alertRepository.countByResolvedFalse();
        long unacknowledgedCount = alertRepository.countByAcknowledgedFalse();

        List<VarianceAlert> highPriority = alertRepository.findHighPriorityUnresolved();

        return AlertStatistics.builder()
                .unresolvedCount(unresolvedCount)
                .unacknowledgedCount(unacknowledgedCount)
                .highPriorityCount((long) highPriority.size())
                .build();
    }

    // Helper methods

    private AlertSeverity determineSeverity(BigDecimal absVariance, BigDecimal variancePercentage) {
        // Critical: > $500 or > 10%
        if (absVariance.compareTo(CRITICAL_THRESHOLD) >= 0 ||
            variancePercentage.compareTo(HIGH_PERCENTAGE) >= 0) {
            return AlertSeverity.CRITICAL;
        }

        // High: > $100 or > 5%
        if (absVariance.compareTo(HIGH_THRESHOLD) >= 0 ||
            variancePercentage.compareTo(MEDIUM_PERCENTAGE) >= 0) {
            return AlertSeverity.HIGH;
        }

        // Medium: > $50 or > 2%
        if (absVariance.compareTo(MEDIUM_THRESHOLD) >= 0 ||
            variancePercentage.compareTo(LOW_PERCENTAGE) >= 0) {
            return AlertSeverity.MEDIUM;
        }

        // Low: > $10
        if (absVariance.compareTo(LOW_THRESHOLD) >= 0) {
            return AlertSeverity.LOW;
        }

        // Below minimum threshold, no alert needed
        return null;
    }

    private BigDecimal getThresholdForSeverity(AlertSeverity severity) {
        return switch (severity) {
            case CRITICAL -> CRITICAL_THRESHOLD;
            case HIGH -> HIGH_THRESHOLD;
            case MEDIUM -> MEDIUM_THRESHOLD;
            case LOW -> LOW_THRESHOLD;
        };
    }

    private String buildAlertMessage(CashReconciliation reconciliation, BigDecimal variance,
                                    BigDecimal variancePercentage, AlertSeverity severity) {
        CashDrawerSession session = reconciliation.getSession();
        String varianceType = variance.compareTo(BigDecimal.ZERO) < 0 ? "shortage" : "overage";

        return String.format("%s variance alert: %s of $%s (%.2f%%) detected in drawer for session %d",
                severity.name(),
                varianceType,
                variance.abs().setScale(2, RoundingMode.HALF_UP),
                variancePercentage.setScale(2, RoundingMode.HALF_UP),
                session.getId());
    }

    private VarianceAlertDTO toDTO(VarianceAlert alert) {
        CashDrawerSession session = alert.getSession();

        return VarianceAlertDTO.builder()
                .alertId(alert.getId())
                .sessionId(session.getId())
                .reconciliationId(alert.getReconciliation().getId())
                .severity(alert.getSeverity())
                .varianceStatus(alert.getVarianceStatus())
                .drawerName("Drawer " + session.getCashDrawerId()) // TODO: Get actual drawer name
                .userName("User " + session.getUserId()) // TODO: Get actual user name
                .variance(alert.getVariance())
                .variancePercentage(alert.getVariancePercentage())
                .threshold(alert.getThreshold())
                .message(alert.getMessage())
                .reason(alert.getReason())
                .createdAt(alert.getCreatedAt())
                .acknowledged(alert.getAcknowledged())
                .acknowledgedAt(alert.getAcknowledgedAt())
                .acknowledgedBy(alert.getAcknowledgedBy())
                .acknowledgedByName(alert.getAcknowledgedBy() != null ? "User " + alert.getAcknowledgedBy() : null)
                .resolved(alert.getResolved())
                .resolvedAt(alert.getResolvedAt())
                .resolvedBy(alert.getResolvedBy())
                .resolutionNotes(alert.getResolutionNotes())
                .build();
    }

    /**
     * Alert statistics DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class AlertStatistics {
        private Long unresolvedCount;
        private Long unacknowledgedCount;
        private Long highPriorityCount;
    }
}
