package com.garbaking.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * QR Token Response DTO
 *
 * Contains the generated QR token and related information.
 * Returned when creating an order or regenerating a QR code.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRTokenResponseDTO {

    /**
     * The full JWT token (to be encoded in QR code)
     */
    private String qrToken;

    /**
     * Token ID (for reference)
     */
    private String tokenId;

    /**
     * Short code fallback (6-8 characters)
     */
    private String shortCode;

    /**
     * When the token was issued
     */
    private LocalDateTime issuedAt;

    /**
     * When the token expires
     */
    private LocalDateTime expiresAt;

    /**
     * Time until expiry in seconds
     */
    private Long expiresInSeconds;

    /**
     * Order ID this token is for
     */
    private Long orderId;

    /**
     * Order number (human-readable)
     */
    private String orderNumber;
}
