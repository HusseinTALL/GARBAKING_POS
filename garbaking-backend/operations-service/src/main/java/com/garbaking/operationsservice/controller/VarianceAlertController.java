package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.report.VarianceAlertDTO;
import com.garbaking.operationsservice.model.AlertSeverity;
import com.garbaking.operationsservice.service.VarianceAlertService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * REST controller for variance alerts
 */
@RestController
@RequestMapping("/api/variance-alerts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VarianceAlertController {

    private final VarianceAlertService alertService;

    /**
     * Get all unresolved alerts
     */
    @GetMapping("/unresolved")
    public ResponseEntity<List<VarianceAlertDTO>> getUnresolvedAlerts() {
        log.info("Fetching unresolved variance alerts");
        List<VarianceAlertDTO> alerts = alertService.getUnresolvedAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get all unacknowledged alerts
     */
    @GetMapping("/unacknowledged")
    public ResponseEntity<List<VarianceAlertDTO>> getUnacknowledgedAlerts() {
        log.info("Fetching unacknowledged variance alerts");
        List<VarianceAlertDTO> alerts = alertService.getUnacknowledgedAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get high priority alerts
     */
    @GetMapping("/high-priority")
    public ResponseEntity<List<VarianceAlertDTO>> getHighPriorityAlerts() {
        log.info("Fetching high priority variance alerts");
        List<VarianceAlertDTO> alerts = alertService.getHighPriorityAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get alerts by severity
     */
    @GetMapping("/severity/{severity}")
    public ResponseEntity<List<VarianceAlertDTO>> getAlertsBySeverity(@PathVariable AlertSeverity severity) {
        log.info("Fetching variance alerts by severity: {}", severity);
        List<VarianceAlertDTO> alerts = alertService.getAlertsBySeverity(severity);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get alerts for date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<VarianceAlertDTO>> getAlertsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Fetching variance alerts from {} to {}", startDate, endDate);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<VarianceAlertDTO> alerts = alertService.getAlertsByDateRange(start, end);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get alerts for specific session
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<VarianceAlertDTO>> getAlertsForSession(@PathVariable Long sessionId) {
        log.info("Fetching variance alerts for session: {}", sessionId);
        List<VarianceAlertDTO> alerts = alertService.getAlertsForSession(sessionId);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Acknowledge an alert
     */
    @PostMapping("/{alertId}/acknowledge")
    public ResponseEntity<VarianceAlertDTO> acknowledgeAlert(
            @PathVariable Long alertId,
            @RequestBody AcknowledgeAlertRequest request) {
        log.info("Acknowledging variance alert: {} by user: {}", alertId, request.getUserId());

        VarianceAlertDTO alert = alertService.acknowledgeAlert(alertId, request.getUserId());
        return ResponseEntity.ok(alert);
    }

    /**
     * Resolve an alert
     */
    @PostMapping("/{alertId}/resolve")
    public ResponseEntity<VarianceAlertDTO> resolveAlert(
            @PathVariable Long alertId,
            @RequestBody ResolveAlertRequest request) {
        log.info("Resolving variance alert: {} by user: {}", alertId, request.getUserId());

        VarianceAlertDTO alert = alertService.resolveAlert(
                alertId,
                request.getUserId(),
                request.getResolutionNotes());
        return ResponseEntity.ok(alert);
    }

    /**
     * Get alert statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<VarianceAlertService.AlertStatistics> getAlertStatistics() {
        log.info("Fetching variance alert statistics");
        VarianceAlertService.AlertStatistics stats = alertService.getAlertStatistics();
        return ResponseEntity.ok(stats);
    }

    // Request DTOs

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcknowledgeAlertRequest {
        private Long userId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResolveAlertRequest {
        private Long userId;
        private String resolutionNotes;
    }
}
