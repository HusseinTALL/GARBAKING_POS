package com.garbaking.orderservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * QRScanAuditLog Entity
 *
 * Comprehensive audit trail for all QR code scan attempts and payment confirmations.
 * Tracks success, failures, security events, and performance metrics.
 */
@Entity
@Table(name = "qr_scan_audit_log", indexes = {
        @Index(name = "idx_order_id", columnList = "orderId"),
        @Index(name = "idx_token_id", columnList = "tokenId"),
        @Index(name = "idx_action", columnList = "action"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_device_id", columnList = "deviceId"),
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_scan_timestamp", columnList = "scanTimestamp"),
        @Index(name = "idx_store_terminal", columnList = "storeId, terminalId")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRScanAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // === Scan Information ===

    /**
     * Order ID (null if token was invalid and order couldn't be retrieved)
     */
    private Long orderId;

    /**
     * Token identifier from the JWT
     */
    @Column(length = 50)
    private String tokenId;

    /**
     * Short code if manual entry was used
     */
    @Column(length = 8)
    private String shortCode;

    // === Action & Status ===

    /**
     * Action performed
     * Values: SCAN, VALIDATE, CONFIRM_PAYMENT, CANCEL, REGENERATE
     */
    @Column(nullable = false, length = 20)
    private String action;

    /**
     * Action outcome
     * Values: SUCCESS, FAILED, EXPIRED, INVALID, DUPLICATE, UNAUTHORIZED
     */
    @Column(nullable = false, length = 20)
    private String status;

    /**
     * Error message if action failed
     */
    @Column(length = 500)
    private String errorMessage;

    // === Device & User Information ===

    /**
     * Unique device identifier
     * Used for tracking and security analysis
     */
    @Column(nullable = false, length = 100)
    private String deviceId;

    /**
     * Device type
     * Values: POS_TERMINAL, MOBILE, TABLET, WEB
     */
    @Column(length = 50)
    private String deviceType;

    /**
     * User who performed the action
     */
    private Long userId;

    /**
     * User's role at time of action
     * Values: ADMIN, STAFF, CASHIER, CUSTOMER
     */
    @Column(length = 20)
    private String userRole;

    // === Timing & Performance ===

    /**
     * When the scan/action occurred
     */
    @Column(nullable = false)
    private LocalDateTime scanTimestamp;

    /**
     * Processing time in milliseconds
     * Used for performance monitoring
     */
    private Integer processingTimeMs;

    // === Network Information ===

    /**
     * IP address of the request
     * IPv4 or IPv6
     */
    @Column(length = 45)
    private String ipAddress;

    /**
     * User agent string from the request
     */
    @Column(length = 500)
    private String userAgent;

    // === Location Information ===

    /**
     * Store/location ID where scan occurred
     */
    private Long storeId;

    /**
     * Terminal ID (e.g., "POS-01", "CASHIER-02")
     */
    @Column(length = 50)
    private String terminalId;

    // === Payment Details (for CONFIRM_PAYMENT actions) ===

    /**
     * Payment method used
     * Values: CASH, CARD, MOBILE_MONEY, BANK_TRANSFER
     */
    @Column(length = 20)
    private String paymentMethod;

    /**
     * Amount paid (from order total)
     */
    private java.math.BigDecimal paymentAmount;

    /**
     * External transaction ID
     * For card payments or mobile money
     */
    @Column(length = 100)
    private String transactionId;

    // === Metadata ===

    /**
     * Timestamp of record creation
     */
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Additional context as JSON (optional)
     * Can store custom fields without schema changes
     */
    @Column(columnDefinition = "TEXT")
    private String metadata;

    // === Helper Methods ===

    /**
     * Check if this was a successful action
     */
    public boolean isSuccess() {
        return "SUCCESS".equals(status);
    }

    /**
     * Check if this was a payment confirmation
     */
    public boolean isPaymentConfirmation() {
        return "CONFIRM_PAYMENT".equals(action);
    }

    /**
     * Check if this was a security event (failed, invalid, etc.)
     */
    public boolean isSecurityEvent() {
        return "FAILED".equals(status)
                || "INVALID".equals(status)
                || "EXPIRED".equals(status)
                || "DUPLICATE".equals(status)
                || "UNAUTHORIZED".equals(status);
    }
}
