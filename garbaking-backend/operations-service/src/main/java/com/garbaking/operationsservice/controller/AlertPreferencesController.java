package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.model.AlertPreferences;
import com.garbaking.operationsservice.repository.AlertPreferencesRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * REST controller for alert preferences management
 */
@RestController
@RequestMapping("/api/alert-preferences")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AlertPreferencesController {

    private final AlertPreferencesRepository preferencesRepository;

    /**
     * Get global alert preferences
     */
    @GetMapping("/global")
    public ResponseEntity<AlertPreferences> getGlobalPreferences() {
        log.info("Fetching global alert preferences");

        AlertPreferences preferences = preferencesRepository.findByUserIdIsNull()
                .orElseGet(() -> {
                    // Create default if not exists
                    AlertPreferences defaults = AlertPreferences.builder().build();
                    return preferencesRepository.save(defaults);
                });

        return ResponseEntity.ok(preferences);
    }

    /**
     * Get user-specific alert preferences
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<AlertPreferences> getUserPreferences(@PathVariable Long userId) {
        log.info("Fetching alert preferences for user: {}", userId);

        AlertPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> preferencesRepository.findByUserIdIsNull()
                        .orElseGet(() -> {
                            AlertPreferences defaults = AlertPreferences.builder().build();
                            return preferencesRepository.save(defaults);
                        }));

        return ResponseEntity.ok(preferences);
    }

    /**
     * Update global alert preferences
     */
    @PutMapping("/global")
    public ResponseEntity<AlertPreferences> updateGlobalPreferences(
            @RequestBody UpdatePreferencesRequest request) {
        log.info("Updating global alert preferences");

        AlertPreferences preferences = preferencesRepository.findByUserIdIsNull()
                .orElseGet(() -> AlertPreferences.builder().build());

        updateFromRequest(preferences, request);
        preferences = preferencesRepository.save(preferences);

        return ResponseEntity.ok(preferences);
    }

    /**
     * Update user-specific preferences
     */
    @PutMapping("/user/{userId}")
    public ResponseEntity<AlertPreferences> updateUserPreferences(
            @PathVariable Long userId,
            @RequestBody UpdatePreferencesRequest request) {
        log.info("Updating alert preferences for user: {}", userId);

        AlertPreferences preferences = preferencesRepository.findByUserId(userId)
                .orElseGet(() -> AlertPreferences.builder().userId(userId).build());

        updateFromRequest(preferences, request);
        preferences.setUserId(userId);
        preferences = preferencesRepository.save(preferences);

        return ResponseEntity.ok(preferences);
    }

    /**
     * Reset to default preferences
     */
    @PostMapping("/reset")
    public ResponseEntity<AlertPreferences> resetToDefaults(@RequestParam(required = false) Long userId) {
        log.info("Resetting alert preferences to defaults for user: {}", userId);

        AlertPreferences preferences;
        if (userId != null) {
            preferences = AlertPreferences.builder().userId(userId).build();
        } else {
            preferences = AlertPreferences.builder().build();
        }

        preferences = preferencesRepository.save(preferences);
        return ResponseEntity.ok(preferences);
    }

    private void updateFromRequest(AlertPreferences preferences, UpdatePreferencesRequest request) {
        if (request.getLowThreshold() != null) {
            preferences.setLowThreshold(request.getLowThreshold());
        }
        if (request.getMediumThreshold() != null) {
            preferences.setMediumThreshold(request.getMediumThreshold());
        }
        if (request.getHighThreshold() != null) {
            preferences.setHighThreshold(request.getHighThreshold());
        }
        if (request.getCriticalThreshold() != null) {
            preferences.setCriticalThreshold(request.getCriticalThreshold());
        }
        if (request.getLowPercentage() != null) {
            preferences.setLowPercentage(request.getLowPercentage());
        }
        if (request.getMediumPercentage() != null) {
            preferences.setMediumPercentage(request.getMediumPercentage());
        }
        if (request.getHighPercentage() != null) {
            preferences.setHighPercentage(request.getHighPercentage());
        }
        if (request.getEmailNotifications() != null) {
            preferences.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getEmailAddress() != null) {
            preferences.setEmailAddress(request.getEmailAddress());
        }
        if (request.getNotifyCriticalOnly() != null) {
            preferences.setNotifyCriticalOnly(request.getNotifyCriticalOnly());
        }
        if (request.getAutoAcknowledgeLow() != null) {
            preferences.setAutoAcknowledgeLow(request.getAutoAcknowledgeLow());
        }
        if (request.getAcknowledgmentTimeoutHours() != null) {
            preferences.setAcknowledgmentTimeoutHours(request.getAcknowledgmentTimeoutHours());
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePreferencesRequest {
        private BigDecimal lowThreshold;
        private BigDecimal mediumThreshold;
        private BigDecimal highThreshold;
        private BigDecimal criticalThreshold;
        private BigDecimal lowPercentage;
        private BigDecimal mediumPercentage;
        private BigDecimal highPercentage;
        private Boolean emailNotifications;
        private String emailAddress;
        private Boolean notifyCriticalOnly;
        private Boolean autoAcknowledgeLow;
        private Integer acknowledgmentTimeoutHours;
    }
}
