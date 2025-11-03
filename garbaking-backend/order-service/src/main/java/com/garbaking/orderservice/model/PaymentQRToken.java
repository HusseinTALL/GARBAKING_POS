package com.garbaking.orderservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * PaymentQRToken Entity
 *
 * Represents a QR code token for order payment confirmation.
 * Tokens are JWT-based, time-limited, and single-use for security.
 */
@Entity
@Table(name = "payment_qr_tokens", indexes = {
        @Index(name = "idx_token_id", columnList = "tokenId"),
        @Index(name = "idx_order_id", columnList = "orderId"),
        @Index(name = "idx_nonce", columnList = "nonce"),
        @Index(name = "idx_short_code", columnList = "shortCode"),
        @Index(name = "idx_expires_at", columnList = "expiresAt"),
        @Index(name = "idx_is_used", columnList = "isUsed")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentQRToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique token identifier (JWT jti claim)
     * Format: "qr_token_{uuid}"
     */
    @Column(nullable = false, unique = true, length = 50)
    private String tokenId;

    /**
     * Reference to the order this token is for
     */
    @Column(nullable = false)
    private Long orderId;

    /**
     * Unique nonce for replay protection
     * Generated once and verified during validation
     */
    @Column(nullable = false, unique = true, length = 100)
    private String nonce;

    /**
     * Short code fallback (6-8 characters)
     * Format: "QR{6 alphanumeric chars}"
     * For manual entry when camera unavailable
     */
    @Column(nullable = false, unique = true, length = 8)
    private String shortCode;

    /**
     * SHA-256 hash of the full JWT token
     * Stored for additional verification
     */
    @Column(nullable = false, length = 255)
    private String tokenHash;

    /**
     * When the token was issued
     */
    @Column(nullable = false)
    private LocalDateTime issuedAt;

    /**
     * When the token expires (typically 5-10 minutes from issuedAt)
     */
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    /**
     * Whether this token has been used for payment confirmation
     * Enforces one-time use for security
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isUsed = false;

    /**
     * When the token was used (if applicable)
     */
    private LocalDateTime usedAt;

    /**
     * Device ID that used this token
     * For audit trail and analytics
     */
    @Column(length = 100)
    private String usedByDeviceId;

    /**
     * User ID who confirmed payment using this token
     * References users table
     */
    private Long usedByUserId;

    /**
     * Timestamp of record creation
     */
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp of last update
     */
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Check if token is expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Check if token is valid for use
     */
    public boolean isValidForUse() {
        return !isUsed && !isExpired();
    }

    /**
     * Mark token as used
     */
    public void markAsUsed(Long userId, String deviceId) {
        this.isUsed = true;
        this.usedAt = LocalDateTime.now();
        this.usedByUserId = userId;
        this.usedByDeviceId = deviceId;
    }
}
