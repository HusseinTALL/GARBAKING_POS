package com.garbaking.orderservice.service;

import com.garbaking.orderservice.dto.ConfirmPaymentDTO;
import com.garbaking.orderservice.dto.OrderDTO;
import com.garbaking.orderservice.dto.QRScanResultDTO;
import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.model.PaymentQRToken;
import com.garbaking.orderservice.model.QRScanAuditLog;
import com.garbaking.orderservice.repository.OrderRepository;
import com.garbaking.orderservice.repository.QRScanAuditLogRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for QR payment workflow
 *
 * Handles scanning QR codes, validating tokens, and confirming payments.
 * Includes comprehensive audit logging for security and analytics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QRPaymentService {

    private final QRTokenService tokenService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final QRScanAuditLogRepository auditLogRepository;
    private final WebSocketService webSocketService;

    /**
     * Scan QR code and retrieve order details
     *
     * @param qrToken JWT token from QR code
     * @param deviceId Device identifier
     * @param userId User performing the scan
     * @return QRScanResultDTO with order details or error
     */
    @Transactional
    public QRScanResultDTO scanQRCode(String qrToken, String deviceId, Long userId) {
        long startTime = System.currentTimeMillis();
        Long orderId = null;
        String tokenId = null;

        try {
            log.info("Scanning QR code - Device: {}, User: {}", deviceId, userId);

            // Validate token
            Claims claims = tokenService.validateToken(qrToken);

            tokenId = claims.getId();
            orderId = claims.get("order_id", Long.class);
            String orderNumber = claims.get("order_number", String.class);
            String shortCode = claims.get("short_code", String.class);

            // Get order
            OrderDTO order = orderService.getOrderById(orderId);

            // Check if order is already paid
            if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
                log.warn("Attempt to scan QR for already paid order: {}", orderNumber);

                logScan(orderId, tokenId, null, "SCAN", "DUPLICATE", deviceId, userId,
                        "Order already paid", null, null, null,
                        System.currentTimeMillis() - startTime);

                return QRScanResultDTO.builder()
                        .success(false)
                        .errorMessage("Order already paid")
                        .errorCode("ORDER_ALREADY_PAID")
                        .build();
            }

            // Log successful scan
            logScan(orderId, tokenId, null, "SCAN", "SUCCESS", deviceId, userId,
                    null, null, null, null,
                    System.currentTimeMillis() - startTime);

            log.info("QR scan successful - Order: {}, Token: {}", orderNumber, tokenId);

            return QRScanResultDTO.builder()
                    .success(true)
                    .order(order)
                    .tokenId(tokenId)
                    .shortCode(shortCode)
                    .expiresAt(LocalDateTime.ofInstant(
                            claims.getExpiration().toInstant(),
                            java.time.ZoneId.systemDefault()
                    ))
                    .build();

        } catch (QRTokenService.InvalidTokenException e) {
            log.error("QR scan failed - Invalid token: {}", e.getMessage());

            String errorCode = getErrorCode(e.getMessage());
            logScan(orderId, tokenId, null, "SCAN", errorCode, deviceId, userId,
                    e.getMessage(), null, null, null,
                    System.currentTimeMillis() - startTime);

            return QRScanResultDTO.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .errorCode(errorCode)
                    .build();

        } catch (Exception e) {
            log.error("QR scan failed - Unexpected error: {}", e.getMessage(), e);

            logScan(orderId, tokenId, null, "SCAN", "FAILED", deviceId, userId,
                    e.getMessage(), null, null, null,
                    System.currentTimeMillis() - startTime);

            return QRScanResultDTO.builder()
                    .success(false)
                    .errorMessage("Failed to scan QR code")
                    .errorCode("SCAN_FAILED")
                    .build();
        }
    }

    /**
     * Scan by short code (fallback when camera unavailable)
     *
     * @param shortCode 6-8 character code
     * @param deviceId Device identifier
     * @param userId User performing the scan
     * @return QRScanResultDTO with order details or error
     */
    @Transactional
    public QRScanResultDTO scanByShortCode(String shortCode, String deviceId, Long userId) {
        long startTime = System.currentTimeMillis();
        Long orderId = null;
        String tokenId = null;

        try {
            log.info("Scanning short code: {} - Device: {}, User: {}", shortCode, deviceId, userId);

            // Validate short code
            PaymentQRToken token = tokenService.validateByShortCode(shortCode);

            tokenId = token.getTokenId();
            orderId = token.getOrderId();

            // Get order
            OrderDTO order = orderService.getOrderById(orderId);

            // Check if order is already paid
            if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
                log.warn("Attempt to use short code for already paid order: {}", order.getOrderNumber());

                logScan(orderId, tokenId, shortCode, "SCAN", "DUPLICATE", deviceId, userId,
                        "Order already paid", null, null, null,
                        System.currentTimeMillis() - startTime);

                return QRScanResultDTO.builder()
                        .success(false)
                        .errorMessage("Order already paid")
                        .errorCode("ORDER_ALREADY_PAID")
                        .build();
            }

            // Log successful scan
            logScan(orderId, tokenId, shortCode, "SCAN", "SUCCESS", deviceId, userId,
                    null, null, null, null,
                    System.currentTimeMillis() - startTime);

            log.info("Short code scan successful - Order: {}, Code: {}", order.getOrderNumber(), shortCode);

            return QRScanResultDTO.builder()
                    .success(true)
                    .order(order)
                    .tokenId(tokenId)
                    .shortCode(shortCode)
                    .expiresAt(token.getExpiresAt())
                    .build();

        } catch (QRTokenService.InvalidTokenException e) {
            log.error("Short code scan failed: {}", e.getMessage());

            String errorCode = getErrorCode(e.getMessage());
            logScan(orderId, tokenId, shortCode, "SCAN", errorCode, deviceId, userId,
                    e.getMessage(), null, null, null,
                    System.currentTimeMillis() - startTime);

            return QRScanResultDTO.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .errorCode(errorCode)
                    .build();

        } catch (Exception e) {
            log.error("Short code scan failed: {}", e.getMessage(), e);

            logScan(orderId, tokenId, shortCode, "SCAN", "FAILED", deviceId, userId,
                    e.getMessage(), null, null, null,
                    System.currentTimeMillis() - startTime);

            return QRScanResultDTO.builder()
                    .success(false)
                    .errorMessage("Failed to scan short code")
                    .errorCode("SCAN_FAILED")
                    .build();
        }
    }

    /**
     * Confirm payment via QR
     *
     * @param orderId Order ID to confirm
     * @param confirmDTO Payment confirmation details
     * @param tokenId Token ID that was scanned
     * @param userId User confirming payment
     * @param deviceId Device used for confirmation
     * @return Updated OrderDTO
     */
    @Transactional
    public OrderDTO confirmPayment(Long orderId, ConfirmPaymentDTO confirmDTO,
                                    String tokenId, Long userId, String deviceId) {
        long startTime = System.currentTimeMillis();

        try {
            log.info("Confirming payment - Order: {}, User: {}, Device: {}", orderId, userId, deviceId);

            // Get order
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

            // Verify order status
            if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
                log.warn("Attempt to confirm already paid order: {}", order.getOrderNumber());

                logScan(orderId, tokenId, null, "CONFIRM_PAYMENT", "DUPLICATE", deviceId, userId,
                        "Order already paid", null, null, null,
                        System.currentTimeMillis() - startTime);

                throw new IllegalStateException("Order already paid");
            }

            // Mark token as used
            tokenService.markTokenUsed(tokenId, userId, deviceId);

            // Update order payment status
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setPaymentMethod(confirmDTO.getPaymentMethod());
            order.setTransactionId(confirmDTO.getTransactionId());
            order.setPaidAt(LocalDateTime.now());

            // Set QR payment tracking fields
            order.setQrPaymentConfirmedAt(LocalDateTime.now());
            order.setQrConfirmedByUserId(userId);
            order.setQrConfirmedByDeviceId(deviceId);

            // If order was PENDING, move to CONFIRMED
            if (order.getStatus() == Order.OrderStatus.PENDING) {
                order.setStatus(Order.OrderStatus.CONFIRMED);
                order.setConfirmedAt(LocalDateTime.now());
            }

            // Save order
            Order savedOrder = orderRepository.save(order);

            // Log successful confirmation
            logScan(orderId, tokenId, null, "CONFIRM_PAYMENT", "SUCCESS", deviceId, userId,
                    null, confirmDTO.getPaymentMethod().toString(),
                    order.getTotalAmount(), confirmDTO.getTransactionId(),
                    System.currentTimeMillis() - startTime);

            // Broadcast WebSocket event
            try {
                webSocketService.broadcastOrderUpdate(savedOrder);
            } catch (Exception e) {
                log.error("Failed to broadcast order update via WebSocket: {}", e.getMessage());
                // Don't fail the payment confirmation if WebSocket fails
            }

            // Convert to DTO
            OrderDTO orderDTO = orderService.mapToDTO(savedOrder);

            log.info("Payment confirmed successfully - Order: {}, Amount: {}, Method: {}",
                    order.getOrderNumber(), order.getTotalAmount(), confirmDTO.getPaymentMethod());

            return orderDTO;

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Payment confirmation failed: {}", e.getMessage());

            logScan(orderId, tokenId, null, "CONFIRM_PAYMENT", "FAILED", deviceId, userId,
                    e.getMessage(), null, null, null,
                    System.currentTimeMillis() - startTime);

            throw e;

        } catch (Exception e) {
            log.error("Payment confirmation failed with unexpected error: {}", e.getMessage(), e);

            logScan(orderId, tokenId, null, "CONFIRM_PAYMENT", "FAILED", deviceId, userId,
                    e.getMessage(), null, null, null,
                    System.currentTimeMillis() - startTime);

            throw new RuntimeException("Failed to confirm payment", e);
        }
    }

    /**
     * Log QR scan audit entry
     */
    private void logScan(Long orderId, String tokenId, String shortCode,
                         String action, String status, String deviceId, Long userId,
                         String errorMessage, String paymentMethod,
                         java.math.BigDecimal paymentAmount, String transactionId,
                         long processingTimeMs) {
        try {
            QRScanAuditLog auditLog = QRScanAuditLog.builder()
                    .orderId(orderId)
                    .tokenId(tokenId)
                    .shortCode(shortCode)
                    .action(action)
                    .status(status)
                    .errorMessage(errorMessage)
                    .deviceId(deviceId)
                    .deviceType("POS_TERMINAL") // Could be determined from device ID
                    .userId(userId)
                    .scanTimestamp(LocalDateTime.now())
                    .processingTimeMs((int) processingTimeMs)
                    .paymentMethod(paymentMethod)
                    .paymentAmount(paymentAmount)
                    .transactionId(transactionId)
                    .build();

            auditLogRepository.save(auditLog);

        } catch (Exception e) {
            // Don't fail the operation if audit logging fails
            log.error("Failed to log QR scan audit: {}", e.getMessage());
        }
    }

    /**
     * Determine error code from exception message
     */
    private String getErrorCode(String errorMessage) {
        if (errorMessage == null) return "UNKNOWN";

        String msg = errorMessage.toLowerCase();

        if (msg.contains("expired")) return "TOKEN_EXPIRED";
        if (msg.contains("already used")) return "TOKEN_USED";
        if (msg.contains("invalid")) return "TOKEN_INVALID";
        if (msg.contains("not found")) return "TOKEN_NOT_FOUND";
        if (msg.contains("nonce")) return "REPLAY_ATTACK";

        return "FAILED";
    }
}
