package com.garbaking.orderservice.controller;

import com.garbaking.orderservice.dto.ConfirmPaymentDTO;
import com.garbaking.orderservice.dto.OrderDTO;
import com.garbaking.orderservice.dto.QRScanResultDTO;
import com.garbaking.orderservice.dto.QRTokenResponseDTO;
import com.garbaking.orderservice.service.OrderService;
import com.garbaking.orderservice.service.QRPaymentService;
import com.garbaking.orderservice.service.QRTokenService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * QR Payment Controller
 *
 * REST API endpoints for QR code-based payment workflow.
 * Handles scanning QR codes, confirming payments, and managing tokens.
 * Includes rate limiting, security, and comprehensive error handling.
 */
@RestController
@RequestMapping("/api/qr-payment")
@RequiredArgsConstructor
@Slf4j
@Validated
public class QRPaymentController {

    private final QRPaymentService qrPaymentService;
    private final QRTokenService qrTokenService;
    private final OrderService orderService;

    // Rate limiting configuration
    @Value("${security.rate-limit.qr-scan.requests:10}")
    private int scanRateLimit;

    @Value("${security.rate-limit.qr-scan.per-seconds:60}")
    private int scanRatePeriod;

    @Value("${security.rate-limit.qr-confirm.requests:5}")
    private int confirmRateLimit;

    @Value("${security.rate-limit.qr-confirm.per-seconds:60}")
    private int confirmRatePeriod;

    // Rate limiter buckets per device
    private final Map<String, Bucket> scanBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> confirmBuckets = new ConcurrentHashMap<>();

    /**
     * Scan QR code and retrieve order details
     *
     * POST /api/qr-payment/scan
     *
     * Request body:
     * {
     *   "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "deviceId": "POS-001"
     * }
     *
     * Response (success):
     * {
     *   "success": true,
     *   "order": { ... },
     *   "tokenId": "qr_abc123",
     *   "shortCode": "QR2A3B4C",
     *   "expiresAt": "2025-11-02T14:30:00"
     * }
     *
     * Response (error):
     * {
     *   "success": false,
     *   "errorMessage": "Token expired",
     *   "errorCode": "TOKEN_EXPIRED"
     * }
     */
    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CASHIER')")
    public ResponseEntity<?> scanQRCode(
            @Valid @RequestBody ScanQRRequest request,
            Authentication authentication
    ) {
        try {
            // Rate limiting
            if (!checkRateLimit(request.getDeviceId(), scanBuckets, scanRateLimit, scanRatePeriod)) {
                log.warn("Rate limit exceeded for device: {} during QR scan", request.getDeviceId());
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of(
                                "success", false,
                                "errorMessage", "Too many scan attempts. Please wait.",
                                "errorCode", "RATE_LIMIT_EXCEEDED"
                        ));
            }

            // Get user ID from authentication
            Long userId = getUserIdFromAuth(authentication);

            // Scan QR code
            QRScanResultDTO result = qrPaymentService.scanQRCode(
                    request.getQrToken(),
                    request.getDeviceId(),
                    userId
            );

            if (Boolean.TRUE.equals(result.getSuccess())) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }

        } catch (Exception e) {
            log.error("Unexpected error during QR scan: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "errorMessage", "Failed to scan QR code",
                            "errorCode", "SCAN_FAILED"
                    ));
        }
    }

    /**
     * Scan by short code (fallback when camera unavailable)
     *
     * POST /api/qr-payment/scan-short-code
     *
     * Request body:
     * {
     *   "shortCode": "QR2A3B4C",
     *   "deviceId": "POS-001"
     * }
     */
    @PostMapping("/scan-short-code")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CASHIER')")
    public ResponseEntity<?> scanByShortCode(
            @Valid @RequestBody ScanShortCodeRequest request,
            Authentication authentication
    ) {
        try {
            // Rate limiting
            if (!checkRateLimit(request.getDeviceId(), scanBuckets, scanRateLimit, scanRatePeriod)) {
                log.warn("Rate limit exceeded for device: {} during short code scan", request.getDeviceId());
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of(
                                "success", false,
                                "errorMessage", "Too many scan attempts. Please wait.",
                                "errorCode", "RATE_LIMIT_EXCEEDED"
                        ));
            }

            // Get user ID
            Long userId = getUserIdFromAuth(authentication);

            // Scan by short code
            QRScanResultDTO result = qrPaymentService.scanByShortCode(
                    request.getShortCode(),
                    request.getDeviceId(),
                    userId
            );

            if (Boolean.TRUE.equals(result.getSuccess())) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }

        } catch (Exception e) {
            log.error("Unexpected error during short code scan: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "errorMessage", "Failed to scan short code",
                            "errorCode", "SCAN_FAILED"
                    ));
        }
    }

    /**
     * Confirm payment via QR
     *
     * POST /api/qr-payment/confirm
     *
     * Request body:
     * {
     *   "orderId": 123,
     *   "tokenId": "qr_abc123",
     *   "paymentMethod": "CASH",
     *   "transactionId": "TXN-2025-001",
     *   "amountReceived": 15000,
     *   "notes": "Optional notes",
     *   "deviceId": "POS-001"
     * }
     */
    @PostMapping("/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CASHIER')")
    public ResponseEntity<?> confirmPayment(
            @Valid @RequestBody ConfirmPaymentRequest request,
            Authentication authentication
    ) {
        try {
            // Rate limiting
            if (!checkRateLimit(request.getDeviceId(), confirmBuckets, confirmRateLimit, confirmRatePeriod)) {
                log.warn("Rate limit exceeded for device: {} during payment confirmation", request.getDeviceId());
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of(
                                "success", false,
                                "errorMessage", "Too many confirmation attempts. Please wait.",
                                "errorCode", "RATE_LIMIT_EXCEEDED"
                        ));
            }

            // Get user ID
            Long userId = getUserIdFromAuth(authentication);

            // Create ConfirmPaymentDTO
            ConfirmPaymentDTO confirmDTO = ConfirmPaymentDTO.builder()
                    .orderId(request.getOrderId())
                    .tokenId(request.getTokenId())
                    .paymentMethod(request.getPaymentMethod())
                    .transactionId(request.getTransactionId())
                    .amountReceived(request.getAmountReceived())
                    .notes(request.getNotes())
                    .build();

            // Confirm payment
            OrderDTO updatedOrder = qrPaymentService.confirmPayment(
                    request.getOrderId(),
                    confirmDTO,
                    request.getTokenId(),
                    userId,
                    request.getDeviceId()
            );

            log.info("Payment confirmed successfully for order: {}", updatedOrder.getOrderNumber());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment confirmed successfully",
                    "order", updatedOrder
            ));

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Payment confirmation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "errorMessage", e.getMessage(),
                            "errorCode", "CONFIRMATION_FAILED"
                    ));

        } catch (Exception e) {
            log.error("Unexpected error during payment confirmation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "errorMessage", "Failed to confirm payment",
                            "errorCode", "CONFIRMATION_FAILED"
                    ));
        }
    }

    /**
     * Get QR token for an order
     *
     * GET /api/qr-payment/orders/{orderId}/token
     *
     * Response:
     * {
     *   "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "tokenId": "qr_abc123",
     *   "shortCode": "QR2A3B4C",
     *   "issuedAt": "2025-11-02T14:25:00",
     *   "expiresAt": "2025-11-02T14:30:00",
     *   "expiresInSeconds": 300,
     *   "orderId": 123,
     *   "orderNumber": "ORD-2025-001"
     * }
     */
    @GetMapping("/orders/{orderId}/token")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CASHIER', 'CUSTOMER')")
    public ResponseEntity<?> getQRTokenForOrder(@PathVariable Long orderId) {
        try {
            log.info("Fetching QR token for order: {}", orderId);

            QRTokenResponseDTO tokenResponse = qrTokenService.getTokenByOrderId(orderId);

            if (tokenResponse == null) {
                log.warn("No valid QR token found for order: {}", orderId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "errorMessage", "No valid QR token found for this order",
                                "errorCode", "TOKEN_NOT_FOUND"
                        ));
            }

            return ResponseEntity.ok(tokenResponse);

        } catch (Exception e) {
            log.error("Error fetching QR token for order {}: {}", orderId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "errorMessage", "Failed to retrieve QR token",
                            "errorCode", "TOKEN_RETRIEVAL_FAILED"
                    ));
        }
    }

    /**
     * Regenerate expired QR token
     *
     * POST /api/qr-payment/orders/{orderId}/regenerate-token
     *
     * Response: Same as getQRTokenForOrder
     */
    @PostMapping("/orders/{orderId}/regenerate-token")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CASHIER')")
    public ResponseEntity<?> regenerateQRToken(@PathVariable Long orderId) {
        try {
            log.info("Regenerating QR token for order: {}", orderId);

            QRTokenResponseDTO tokenResponse = orderService.regenerateQRToken(orderId);

            log.info("QR token regenerated successfully for order: {}", orderId);
            return ResponseEntity.ok(tokenResponse);

        } catch (IllegalStateException e) {
            log.error("Cannot regenerate QR token for order {}: {}", orderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "errorMessage", e.getMessage(),
                            "errorCode", "REGENERATION_NOT_ALLOWED"
                    ));

        } catch (Exception e) {
            log.error("Error regenerating QR token for order {}: {}", orderId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "errorMessage", "Failed to regenerate QR token",
                            "errorCode", "REGENERATION_FAILED"
                    ));
        }
    }

    // ==================== Helper Methods ====================

    /**
     * Check rate limit for device
     */
    private boolean checkRateLimit(String deviceId, Map<String, Bucket> buckets,
                                     int requests, int perSeconds) {
        Bucket bucket = buckets.computeIfAbsent(deviceId, key -> {
            Bandwidth limit = Bandwidth.classic(requests, Refill.intervally(requests, Duration.ofSeconds(perSeconds)));
            return Bucket.builder()
                    .addLimit(limit)
                    .build();
        });

        return bucket.tryConsume(1);
    }

    /**
     * Extract user ID from authentication
     */
    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() != null) {
            // Assuming principal is a User object with getId() method
            // Adjust based on your authentication implementation
            try {
                Object principal = authentication.getPrincipal();
                if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                    // If using Spring Security UserDetails, extract user ID
                    // This is a placeholder - adjust based on your User model
                    return 1L; // TODO: Extract actual user ID from authentication
                }
            } catch (Exception e) {
                log.warn("Could not extract user ID from authentication: {}", e.getMessage());
            }
        }
        return null;
    }

    // ==================== Request DTOs ====================

    /**
     * Request DTO for scanning QR code
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ScanQRRequest {
        @NotBlank(message = "QR token is required")
        private String qrToken;

        @NotBlank(message = "Device ID is required")
        private String deviceId;
    }

    /**
     * Request DTO for scanning short code
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ScanShortCodeRequest {
        @NotBlank(message = "Short code is required")
        private String shortCode;

        @NotBlank(message = "Device ID is required")
        private String deviceId;
    }

    /**
     * Request DTO for confirming payment
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ConfirmPaymentRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;

        @NotBlank(message = "Token ID is required")
        private String tokenId;

        @NotNull(message = "Payment method is required")
        private com.garbaking.orderservice.model.Order.PaymentMethod paymentMethod;

        private String transactionId;

        private java.math.BigDecimal amountReceived;

        private String notes;

        @NotBlank(message = "Device ID is required")
        private String deviceId;
    }
}
