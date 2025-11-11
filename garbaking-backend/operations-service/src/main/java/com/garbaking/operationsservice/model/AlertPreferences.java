package com.garbaking.operationsservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Alert notification preferences for cash management
 */
@Entity
@Table(name = "alert_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId; // null means global settings

    // Variance thresholds
    @Column(name = "low_threshold", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal lowThreshold = BigDecimal.valueOf(10);

    @Column(name = "medium_threshold", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal mediumThreshold = BigDecimal.valueOf(50);

    @Column(name = "high_threshold", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal highThreshold = BigDecimal.valueOf(100);

    @Column(name = "critical_threshold", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal criticalThreshold = BigDecimal.valueOf(500);

    // Percentage thresholds
    @Column(name = "low_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal lowPercentage = BigDecimal.valueOf(2);

    @Column(name = "medium_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal mediumPercentage = BigDecimal.valueOf(5);

    @Column(name = "high_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal highPercentage = BigDecimal.valueOf(10);

    // Notification settings
    @Column(name = "email_notifications")
    @Builder.Default
    private Boolean emailNotifications = false;

    @Column(name = "email_address", length = 255)
    private String emailAddress;

    @Column(name = "notify_critical_only")
    @Builder.Default
    private Boolean notifyCriticalOnly = false;

    // Alert behavior
    @Column(name = "auto_acknowledge_low")
    @Builder.Default
    private Boolean autoAcknowledgeLow = false;

    @Column(name = "acknowledgment_timeout_hours")
    @Builder.Default
    private Integer acknowledgmentTimeoutHours = 24;

    // Audit
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
