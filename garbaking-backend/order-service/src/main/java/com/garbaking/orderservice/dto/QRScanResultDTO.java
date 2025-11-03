package com.garbaking.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * QR Scan Result DTO
 *
 * Response when a QR code is scanned successfully.
 * Contains order details and token information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRScanResultDTO {

    /**
     * Whether the scan was successful
     */
    private Boolean success;

    /**
     * Full order details
     */
    private OrderDTO order;

    /**
     * Token ID that was scanned
     */
    private String tokenId;

    /**
     * Short code for this token (fallback)
     */
    private String shortCode;

    /**
     * When the token expires
     */
    private LocalDateTime expiresAt;

    /**
     * Error message if scan failed
     */
    private String errorMessage;

    /**
     * Error code for client handling
     * Values: TOKEN_EXPIRED, TOKEN_USED, TOKEN_INVALID, ORDER_ALREADY_PAID, etc.
     */
    private String errorCode;
}
