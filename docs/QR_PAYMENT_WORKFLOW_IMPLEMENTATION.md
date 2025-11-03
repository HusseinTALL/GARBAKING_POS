# 📱 QR Payment Workflow - Implementation Plan

**Feature:** QR Code-based Order Payment Confirmation
**Priority:** HIGH
**Status:** Planning Phase
**Date:** November 2, 2025

---

## 🎯 **Executive Summary**

Implement a secure, offline-first QR code workflow that allows cashiers to scan customer order QR codes to instantly retrieve order details and confirm payment. The system must work seamlessly online and offline, with robust security measures including JWT signing, replay protection, and rate limiting.

---

## 📋 **Requirements Overview**

### **Functional Requirements**
1. ✅ Generate unique QR code for each order upon creation (PENDING status)
2. ✅ Display QR code in Customer App and order receipts
3. ✅ Cashier scans QR → retrieves full order details
4. ✅ Cashier confirms payment → order transitions PENDING → PAID → FULFILLED
5. ✅ Offline-first: queue payment confirmations when offline, sync when online
6. ✅ Fallback: 6-8 character short code for devices without camera
7. ✅ Audit trail: track all scans, confirmations, and failures

### **Security Requirements**
1. ✅ JWT-based QR tokens with HMAC-SHA256 signing
2. ✅ 5-10 minute TTL for payment QR codes
3. ✅ Replay protection using nonce/jti
4. ✅ Rate limiting on scan endpoints
5. ✅ RBAC: only authorized roles can confirm payment
6. ✅ No PII (personally identifiable information) in QR code
7. ✅ Device fingerprinting for audit logs

### **Performance Requirements**
1. ✅ QR generation: < 100ms
2. ✅ QR scan-to-display: < 500ms
3. ✅ Payment confirmation: < 1 second
4. ✅ Offline sync: < 5 seconds after reconnection

---

## 🏗️ **Architecture Overview**

### **System Flow Diagram**

```
┌─────────────────┐
│ Order Created   │
│  (PENDING)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Generate QR Token               │
│ - JWT with order_id, nonce      │
│ - HMAC-SHA256 signed            │
│ - 5-10 min expiry               │
│ - Generate short code           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Store Token in DB               │
│ - payment_qr_tokens table       │
│ - nonce for replay protection   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Display QR in Customer App      │
│ - Show QR code image            │
│ - Show short code fallback      │
│ - Auto-refresh if expired       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Cashier Scans QR                │
│ - Camera or manual entry        │
│ - Decode JWT token              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Validate Token                  │
│ - Verify signature              │
│ - Check expiry                  │
│ - Check nonce (replay)          │
│ - Check order status            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Retrieve Order Details          │
│ - GET /api/orders/:id           │
│ - Full order + customer info    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Display Order in Modal          │
│ - Items, totals, customer       │
│ - Payment options               │
│ - Actions: Confirm, Cancel      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Cashier Confirms Payment        │
│ - Select payment method         │
│ - Add transaction ID            │
│ - Click "Confirm Payment"       │
└────────┬────────────────────────┘
         │
         ├─── Online ───────────────────┐
         │                              │
         ▼                              ▼
┌──────────────────────┐    ┌────────────────────┐
│ POST /api/qr/confirm │    │ Queue in IndexedDB │
│ - Verify RBAC        │    │ - Store intent     │
│ - Check duplicate    │    │ - Device ID        │
│ - Update order       │    │ - Timestamp        │
│ - Mark nonce used    │    └─────────┬──────────┘
│ - Log audit event    │              │
└──────────┬───────────┘              │
           │                          │
           │    ┌─────────────────────┘
           │    │ Network Reconnects
           │    ▼
           │ ┌──────────────────────┐
           │ │ Sync Queue           │
           │ │ - POST queued items  │
           │ │ - Idempotent check   │
           │ │ - Clear on success   │
           │ └──────────┬───────────┘
           │            │
           └────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Update Order Status             │
│ PENDING → PAID                  │
│ paidAt = now()                  │
│ paymentStatus = PAID            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Broadcast WebSocket Event       │
│ - Notify all connected clients  │
│ - Customer app shows success    │
│ - Kitchen display updates       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Order Status: PAID              │
│ → Can proceed to PREPARING      │
└─────────────────────────────────┘
```

---

## 💾 **Database Schema Changes**

### **1. New Table: `payment_qr_tokens`**

```sql
CREATE TABLE payment_qr_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Token Information
    token_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'JWT jti (unique token identifier)',
    order_id BIGINT NOT NULL COMMENT 'Reference to orders table',
    nonce VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique nonce for replay protection',
    short_code VARCHAR(8) NOT NULL UNIQUE COMMENT 'Fallback short code (6-8 chars)',

    -- Security
    token_hash VARCHAR(255) NOT NULL COMMENT 'SHA-256 hash of full JWT for verification',
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL COMMENT '5-10 minutes from issued_at',

    -- Usage Tracking
    is_used BOOLEAN DEFAULT FALSE COMMENT 'True if token was used for payment',
    used_at TIMESTAMP NULL COMMENT 'When token was used',
    used_by_device_id VARCHAR(100) NULL COMMENT 'Device that used the token',
    used_by_user_id BIGINT NULL COMMENT 'User who confirmed payment',

    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_qr_token_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_qr_token_user FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL,

    -- Indexes
    INDEX idx_token_id (token_id),
    INDEX idx_order_id (order_id),
    INDEX idx_nonce (nonce),
    INDEX idx_short_code (short_code),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_used (is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='QR payment tokens for order confirmation';
```

### **2. New Table: `qr_scan_audit_log`**

```sql
CREATE TABLE qr_scan_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Scan Information
    order_id BIGINT NULL COMMENT 'Order ID (null if token invalid)',
    token_id VARCHAR(50) NULL COMMENT 'Token identifier',
    short_code VARCHAR(8) NULL COMMENT 'Short code if used',

    -- Action
    action VARCHAR(20) NOT NULL COMMENT 'SCAN, CONFIRM_PAYMENT, CANCEL, VALIDATE',
    status VARCHAR(20) NOT NULL COMMENT 'SUCCESS, FAILED, EXPIRED, INVALID, DUPLICATE',
    error_message VARCHAR(500) NULL COMMENT 'Error details if failed',

    -- Device & User
    device_id VARCHAR(100) NOT NULL COMMENT 'Unique device identifier',
    device_type VARCHAR(50) NULL COMMENT 'POS, MOBILE, TABLET',
    user_id BIGINT NULL COMMENT 'User who performed action',
    user_role VARCHAR(20) NULL COMMENT 'ADMIN, STAFF, CASHIER',

    -- Timing
    scan_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms INT NULL COMMENT 'Time to process request',

    -- Network
    ip_address VARCHAR(45) NULL COMMENT 'IP address of request',
    user_agent VARCHAR(500) NULL COMMENT 'User agent string',

    -- Location (if available)
    store_id BIGINT NULL COMMENT 'Store/location ID',
    terminal_id VARCHAR(50) NULL COMMENT 'Terminal ID',

    -- Payment Details (for CONFIRM_PAYMENT actions)
    payment_method VARCHAR(20) NULL COMMENT 'CASH, CARD, MOBILE_MONEY',
    payment_amount DECIMAL(10, 2) NULL COMMENT 'Amount paid',
    transaction_id VARCHAR(100) NULL COMMENT 'External transaction ID',

    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_order_id (order_id),
    INDEX idx_token_id (token_id),
    INDEX idx_action (action),
    INDEX idx_status (status),
    INDEX idx_device_id (device_id),
    INDEX idx_user_id (user_id),
    INDEX idx_scan_timestamp (scan_timestamp),
    INDEX idx_store_terminal (store_id, terminal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Audit log for QR code scans and payment confirmations';
```

### **3. Update `orders` table**

Add new fields to track QR payment workflow:

```sql
ALTER TABLE orders
ADD COLUMN qr_token_id VARCHAR(50) NULL COMMENT 'Current active QR token for this order',
ADD COLUMN qr_payment_confirmed_at TIMESTAMP NULL COMMENT 'When payment was confirmed via QR',
ADD COLUMN qr_confirmed_by_user_id BIGINT NULL COMMENT 'User who confirmed payment via QR',
ADD COLUMN qr_confirmed_by_device_id VARCHAR(100) NULL COMMENT 'Device used for QR confirmation',
ADD INDEX idx_qr_token_id (qr_token_id);

ALTER TABLE orders
ADD CONSTRAINT fk_order_qr_confirmed_user FOREIGN KEY (qr_confirmed_by_user_id)
    REFERENCES users(id) ON DELETE SET NULL;
```

---

## 🔐 **JWT Token Structure**

### **Token Payload**

```json
{
  "jti": "qr_token_xyz123",          // Unique token ID
  "iss": "garbaking-pos",             // Issuer
  "aud": "payment-confirmation",      // Audience
  "sub": "order_12345",               // Subject: order ID
  "iat": 1730534400,                  // Issued at (Unix timestamp)
  "exp": 1730534700,                  // Expires (5 min later)
  "order_id": 12345,                  // Order ID
  "order_number": "ORD-20251102-0001", // Human-readable order number
  "nonce": "abc123def456",            // Unique nonce for replay protection
  "amount": "25.50",                  // Total amount (for display only)
  "currency": "XOF",                  // Currency code
  "short_code": "QR12AB",             // Fallback short code
  "v": 1                              // Token version
}
```

### **Token Encoding**

```
QR Code Data = JWT Token (Base64URL encoded)

Example:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJxcl90b2tlbl94eXoxMjMiLCJpc3MiOiJnYXJiYWtpbmctcG9zIiwiYXVkIjoicGF5bWVudC1jb25maXJtYXRpb24iLCJzdWIiOiJvcmRlcl8xMjM0NSIsImlhdCI6MTczMDUzNDQwMCwiZXhwIjoxNzMwNTM0NzAwLCJvcmRlcl9pZCI6MTIzNDUsIm9yZGVyX251bWJlciI6Ik9SRC0yMDI1MTEwMi0wMDAxIiwibm9uY2UiOiJhYmMxMjNkZWY0NTYiLCJhbW91bnQiOiIyNS41MCIsImN1cnJlbmN5IjoiWE9GIiwic2hvcnRfY29kZSI6IlFSMTJBQiIsInYiOjF9.signature
```

---

## 🚀 **Backend Implementation**

### **Phase 1: Core Services**

#### **1.1. QRTokenService.java**

Location: `garbaking-backend/order-service/src/main/java/com/garbaking/orderservice/service/QRTokenService.java`

```java
package com.garbaking.orderservice.service;

import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.model.PaymentQRToken;
import com.garbaking.orderservice.repository.PaymentQRTokenRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

/**
 * Service for generating and validating QR payment tokens
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QRTokenService {

    private final PaymentQRTokenRepository tokenRepository;

    @Value("${qr.token.secret}")
    private String secret;

    @Value("${qr.token.expiry.minutes:5}")
    private int expiryMinutes;

    @Value("${qr.token.issuer:garbaking-pos}")
    private String issuer;

    /**
     * Generate QR token for an order
     */
    @Transactional
    public PaymentQRToken generateToken(Order order) {
        log.info("Generating QR token for order: {}", order.getOrderNumber());

        // Generate unique identifiers
        String tokenId = "qr_" + UUID.randomUUID().toString();
        String nonce = UUID.randomUUID().toString();
        String shortCode = generateShortCode();

        // Calculate expiry
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(expiryMinutes);

        // Build JWT
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .setId(tokenId)
                .setIssuer(issuer)
                .setAudience("payment-confirmation")
                .setSubject("order_" + order.getId())
                .setIssuedAt(Date.from(now.atZone(ZoneId.systemDefault()).toInstant()))
                .setExpiration(Date.from(expiresAt.atZone(ZoneId.systemDefault()).toInstant()))
                .claim("order_id", order.getId())
                .claim("order_number", order.getOrderNumber())
                .claim("nonce", nonce)
                .claim("amount", order.getTotalAmount().toString())
                .claim("currency", "XOF")
                .claim("short_code", shortCode)
                .claim("v", 1)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        // Hash token for storage
        String tokenHash = hashToken(token);

        // Save to database
        PaymentQRToken qrToken = PaymentQRToken.builder()
                .tokenId(tokenId)
                .orderId(order.getId())
                .nonce(nonce)
                .shortCode(shortCode)
                .tokenHash(tokenHash)
                .issuedAt(now)
                .expiresAt(expiresAt)
                .build();

        tokenRepository.save(qrToken);

        // Store token reference in order
        order.setQrTokenId(tokenId);

        log.info("QR token generated: {} (expires at: {})", tokenId, expiresAt);
        return qrToken;
    }

    /**
     * Validate and decode QR token
     */
    public Claims validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

            // Parse and validate JWT
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .requireIssuer(issuer)
                    .requireAudience("payment-confirmation")
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Check if token exists and is not used
            String tokenId = claims.getId();
            PaymentQRToken qrToken = tokenRepository.findByTokenId(tokenId)
                    .orElseThrow(() -> new InvalidTokenException("Token not found"));

            if (qrToken.getIsUsed()) {
                throw new InvalidTokenException("Token already used");
            }

            // Verify nonce matches
            String nonce = claims.get("nonce", String.class);
            if (!qrToken.getNonce().equals(nonce)) {
                throw new InvalidTokenException("Nonce mismatch");
            }

            log.info("Token validated successfully: {}", tokenId);
            return claims;

        } catch (ExpiredJwtException e) {
            log.warn("Token expired: {}", e.getMessage());
            throw new InvalidTokenException("Token expired");
        } catch (JwtException e) {
            log.error("Invalid token: {}", e.getMessage());
            throw new InvalidTokenException("Invalid token");
        }
    }

    /**
     * Mark token as used
     */
    @Transactional
    public void markTokenUsed(String tokenId, Long userId, String deviceId) {
        PaymentQRToken token = tokenRepository.findByTokenId(tokenId)
                .orElseThrow(() -> new InvalidTokenException("Token not found"));

        token.setIsUsed(true);
        token.setUsedAt(LocalDateTime.now());
        token.setUsedByUserId(userId);
        token.setUsedByDeviceId(deviceId);

        tokenRepository.save(token);
        log.info("Token marked as used: {}", tokenId);
    }

    /**
     * Validate token by short code
     */
    public PaymentQRToken validateByShortCode(String shortCode) {
        PaymentQRToken token = tokenRepository.findByShortCode(shortCode.toUpperCase())
                .orElseThrow(() -> new InvalidTokenException("Invalid short code"));

        if (token.getIsUsed()) {
            throw new InvalidTokenException("Short code already used");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Short code expired");
        }

        return token;
    }

    /**
     * Generate random 6-8 character short code
     */
    private String generateShortCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars
        StringBuilder code = new StringBuilder("QR");

        for (int i = 0; i < 6; i++) {
            int index = (int) (Math.random() * chars.length());
            code.append(chars.charAt(index));
        }

        return code.toString();
    }

    /**
     * Hash token using SHA-256
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }
}
```

#### **1.2. QRPaymentService.java**

Location: `garbaking-backend/order-service/src/main/java/com/garbaking/orderservice/service/QRPaymentService.java`

```java
package com.garbaking.orderservice.service;

import com.garbaking.orderservice.dto.ConfirmPaymentDTO;
import com.garbaking.orderservice.dto.OrderDTO;
import com.garbaking.orderservice.dto.QRScanResultDTO;
import com.garbaking.orderservice.model.Order;
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
     */
    @Transactional
    public QRScanResultDTO scanQRCode(String qrToken, String deviceId, Long userId) {
        long startTime = System.currentTimeMillis();

        try {
            // Validate token
            Claims claims = tokenService.validateToken(qrToken);

            Long orderId = claims.get("order_id", Long.class);
            String orderNumber = claims.get("order_number", String.class);

            // Get order
            OrderDTO order = orderService.getOrderById(orderId);

            // Check order status
            if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
                logScan(orderId, claims.getId(), "SCAN", "DUPLICATE", deviceId, userId,
                       "Order already paid", System.currentTimeMillis() - startTime);
                throw new IllegalStateException("Order already paid");
            }

            // Log successful scan
            logScan(orderId, claims.getId(), "SCAN", "SUCCESS", deviceId, userId,
                   null, System.currentTimeMillis() - startTime);

            return QRScanResultDTO.builder()
                    .success(true)
                    .order(order)
                    .tokenId(claims.getId())
                    .shortCode(claims.get("short_code", String.class))
                    .expiresAt(claims.getExpiration())
                    .build();

        } catch (Exception e) {
            log.error("QR scan failed: {}", e.getMessage());
            logScan(null, null, "SCAN", "FAILED", deviceId, userId,
                   e.getMessage(), System.currentTimeMillis() - startTime);
            throw e;
        }
    }

    /**
     * Confirm payment via QR
     */
    @Transactional
    public OrderDTO confirmPayment(Long orderId, ConfirmPaymentDTO confirmDTO,
                                    String tokenId, Long userId, String deviceId) {
        long startTime = System.currentTimeMillis();

        try {
            // Get order
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found"));

            // Verify order status
            if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
                logScan(orderId, tokenId, "CONFIRM_PAYMENT", "DUPLICATE", deviceId, userId,
                       "Order already paid", System.currentTimeMillis() - startTime);
                throw new IllegalStateException("Order already paid");
            }

            // Mark token as used
            tokenService.markTokenUsed(tokenId, userId, deviceId);

            // Update order payment status
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setPaymentMethod(confirmDTO.getPaymentMethod());
            order.setTransactionId(confirmDTO.getTransactionId());
            order.setPaidAt(LocalDateTime.now());
            order.setQrPaymentConfirmedAt(LocalDateTime.now());
            order.setQrConfirmedByUserId(userId);
            order.setQrConfirmedByDeviceId(deviceId);

            // If order was PENDING, move to CONFIRMED
            if (order.getStatus() == Order.OrderStatus.PENDING) {
                order.setStatus(Order.OrderStatus.CONFIRMED);
                order.setConfirmedAt(LocalDateTime.now());
            }

            Order savedOrder = orderRepository.save(order);

            // Log successful confirmation
            logScan(orderId, tokenId, "CONFIRM_PAYMENT", "SUCCESS", deviceId, userId,
                   null, System.currentTimeMillis() - startTime);

            // Broadcast WebSocket event
            webSocketService.broadcastOrderUpdate(savedOrder);

            // Convert to DTO
            OrderDTO orderDTO = orderService.mapToDTO(savedOrder);

            log.info("Payment confirmed for order {} via QR by user {}",
                    order.getOrderNumber(), userId);

            return orderDTO;

        } catch (Exception e) {
            log.error("Payment confirmation failed: {}", e.getMessage());
            logScan(orderId, tokenId, "CONFIRM_PAYMENT", "FAILED", deviceId, userId,
                   e.getMessage(), System.currentTimeMillis() - startTime);
            throw e;
        }
    }

    /**
     * Log QR scan audit entry
     */
    private void logScan(Long orderId, String tokenId, String action, String status,
                        String deviceId, Long userId, String errorMessage, long processingTimeMs) {
        try {
            QRScanAuditLog log = QRScanAuditLog.builder()
                    .orderId(orderId)
                    .tokenId(tokenId)
                    .action(action)
                    .status(status)
                    .errorMessage(errorMessage)
                    .deviceId(deviceId)
                    .userId(userId)
                    .processingTimeMs((int) processingTimeMs)
                    .scanTimestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to log QR scan audit: {}", e.getMessage());
        }
    }
}
```

### **Phase 2: API Endpoints**

#### **2.1. QRPaymentController.java**

Location: `garbaking-backend/order-service/src/main/java/com/garbaking/orderservice/controller/QRPaymentController.java`

```java
package com.garbaking.orderservice.controller;

import com.garbaking.orderservice.dto.ConfirmPaymentDTO;
import com.garbaking.orderservice.dto.OrderDTO;
import com.garbaking.orderservice.dto.QRScanResultDTO;
import com.garbaking.orderservice.service.QRPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * QR Payment Controller
 *
 * Endpoints for QR code payment workflow
 */
@RestController
@RequestMapping("/qr-payment")
@RequiredArgsConstructor
@Slf4j
public class QRPaymentController {

    private final QRPaymentService qrPaymentService;

    /**
     * Scan QR code and retrieve order details
     * POST /qr-payment/scan
     */
    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CASHIER')")
    public ResponseEntity<QRScanResultDTO> scanQRCode(
            @RequestBody String qrToken,
            @RequestHeader("X-Device-Id") String deviceId,
            @RequestHeader("X-User-Id") Long userId
    ) {
        log.info("POST /qr-payment/scan - Device: {}, User: {}", deviceId, userId);
        QRScanResultDTO result = qrPaymentService.scanQRCode(qrToken, deviceId, userId);
        return ResponseEntity.ok(result);
    }

    /**
     * Confirm payment via QR
     * POST /qr-payment/confirm
     */
    @PostMapping("/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CASHIER')")
    public ResponseEntity<OrderDTO> confirmPayment(
            @Valid @RequestBody ConfirmPaymentDTO confirmDTO,
            @RequestHeader("X-Device-Id") String deviceId,
            @RequestHeader("X-User-Id") Long userId
    ) {
        log.info("POST /qr-payment/confirm - Order: {}, Device: {}, User: {}",
                confirmDTO.getOrderId(), deviceId, userId);

        OrderDTO order = qrPaymentService.confirmPayment(
                confirmDTO.getOrderId(),
                confirmDTO,
                confirmDTO.getTokenId(),
                userId,
                deviceId
        );

        return ResponseEntity.ok(order);
    }
}
```

---

## 📱 **Frontend Implementation**

### **Phase 3: Customer App - QR Display**

#### **3.1. QRCodeDisplay.vue**

Location: `frontend/customer-app/src/components/QRCodeDisplay.vue`

```vue
<template>
  <div class="qr-code-display">
    <!-- QR Code Image -->
    <div class="qr-code-container">
      <div v-if="loading" class="qr-loading">
        <div class="spinner"></div>
        <p>Generating QR Code...</p>
      </div>

      <div v-else-if="error" class="qr-error">
        <FontAwesomeIcon :icon="['fas', 'exclamation-circle']" class="error-icon" />
        <p>{{ error }}</p>
        <button @click="regenerateQR" class="retry-btn">Retry</button>
      </div>

      <div v-else class="qr-display">
        <!-- QR Code -->
        <canvas ref="qrCanvas" class="qr-canvas"></canvas>

        <!-- Expiry Timer -->
        <div class="expiry-timer" :class="{ 'expiring-soon': timeRemaining < 60 }">
          <FontAwesomeIcon :icon="['fas', 'clock']" />
          <span>Expires in {{ formatTimeRemaining }}</span>
        </div>

        <!-- Short Code Fallback -->
        <div class="short-code-section">
          <p class="short-code-label">Or enter this code:</p>
          <div class="short-code">{{ shortCode }}</div>
          <button @click="copyShortCode" class="copy-btn">
            <FontAwesomeIcon :icon="['fas', 'copy']" />
            {{ copied ? 'Copied!' : 'Copy Code' }}
          </button>
        </div>

        <!-- Instructions -->
        <div class="instructions">
          <p>Show this QR code to the cashier to confirm your payment</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import QRCode from 'qrcode'
import { useToast } from 'vue-toastification'

interface Props {
  orderId: number
  orderNumber: string
  qrToken: string
  shortCode: string
  expiresAt: Date
}

const props = defineProps<Props>()
const emit = defineEmits(['expired', 'regenerate'])

const toast = useToast()
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const error = ref('')
const timeRemaining = ref(0)
const copied = ref(false)
let timerInterval: number | null = null

const formatTimeRemaining = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

onMounted(async () => {
  await generateQR()
  startTimer()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

async function generateQR() {
  try {
    loading.value = true
    error.value = ''

    if (!qrCanvas.value) {
      throw new Error('Canvas not available')
    }

    // Generate QR code
    await QRCode.toCanvas(qrCanvas.value, props.qrToken, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })

    loading.value = false
  } catch (err) {
    console.error('QR generation error:', err)
    error.value = 'Failed to generate QR code'
    loading.value = false
  }
}

function startTimer() {
  updateTimeRemaining()

  timerInterval = window.setInterval(() => {
    updateTimeRemaining()

    if (timeRemaining.value <= 0) {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
      emit('expired')
      toast.warning('QR code expired. Please refresh.')
    }
  }, 1000)
}

function updateTimeRemaining() {
  const now = new Date().getTime()
  const expiryTime = new Date(props.expiresAt).getTime()
  const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000))
  timeRemaining.value = remaining
}

function regenerateQR() {
  emit('regenerate')
}

async function copyShortCode() {
  try {
    await navigator.clipboard.writeText(props.shortCode)
    copied.value = true
    toast.success('Code copied!')

    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
    toast.error('Failed to copy code')
  }
}
</script>

<style scoped>
.qr-code-display {
  padding: 1rem;
}

.qr-code-container {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.qr-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.qr-canvas {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.expiry-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
}

.expiry-timer.expiring-soon {
  background: #fee2e2;
  color: #dc2626;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.short-code-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  width: 100%;
}

.short-code-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.short-code {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.25rem;
  color: #1f2937;
  font-family: 'Courier New', monospace;
}

.copy-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #2563eb;
}

.instructions {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  width: 100%;
}

.qr-loading,
.qr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.retry-btn:hover {
  background: #2563eb;
}
</style>
```

---

## ⚙️ **Configuration Files**

### **application.yml (Order Service)**

```yaml
qr:
  token:
    secret: ${QR_TOKEN_SECRET:your-256-bit-secret-key-change-in-production}
    expiry:
      minutes: 5
    issuer: garbaking-pos

security:
  rate-limit:
    qr-scan:
      requests: 10
      per-seconds: 60
    qr-confirm:
      requests: 5
      per-seconds: 60
```

---

## ✅ **Acceptance Tests**

### **Test Cases**

1. **✅ Online Payment Confirmation**
   - Customer creates order → QR generated
   - Cashier scans QR → order details displayed
   - Cashier confirms payment → order status: PENDING → PAID
   - Customer app receives real-time update

2. **✅ Offline Payment Confirmation**
   - Cashier device goes offline
   - Cashier scans QR → queued in IndexedDB
   - Device reconnects → auto-sync
   - Order status updated, no duplicates

3. **✅ Expired QR Code**
   - Wait 5+ minutes after QR generation
   - Attempt scan → error "Token expired"
   - Customer regenerates QR → new scan succeeds

4. **✅ Replayed QR Code**
   - Confirm payment with QR
   - Attempt to scan same QR again → error "Token already used"

5. **✅ Wrong Tenant/Site**
   - Generate QR on Site A
   - Attempt scan on Site B → error "Invalid token"

6. **✅ Partial Sync**
   - Queue 5 payments offline
   - Reconnect with slow network
   - All 5 sync successfully, no duplicates

7. **✅ Idempotent Confirm**
   - Send confirm request twice (network retry)
   - Only one payment recorded
   - Second request returns "already paid"

8. **✅ Short Code Fallback**
   - Camera unavailable
   - Manual entry of short code
   - Order retrieved successfully

9. **✅ Rate Limiting**
   - Attempt 20 scans in 1 minute
   - After 10, receive "Rate limit exceeded"

10. **✅ RBAC Enforcement**
    - Customer role attempts confirm → 403 Forbidden
    - Staff role confirms → Success

---

## 📊 **Monitoring & Analytics**

### **Key Metrics**

1. **Performance Metrics**
   - QR scan latency (p50, p95, p99)
   - Payment confirmation time
   - Offline sync duration
   - Token generation time

2. **Usage Metrics**
   - Total QR scans per day/week/month
   - Successful vs failed scans
   - Expired token rate
   - Short code usage rate

3. **Security Metrics**
   - Replay attempt count
   - Rate limit hits
   - Invalid token attempts
   - Unauthorized access attempts

4. **Business Metrics**
   - QR payment adoption rate
   - Average time from order to payment
   - QR vs manual payment ratio
   - Payment method distribution

### **Alerts**

1. **Critical**
   - QR scan success rate < 95%
   - Payment confirmation failure > 5%
   - Token generation errors

2. **Warning**
   - Expired token rate > 10%
   - Offline sync queue > 50 items
   - Average scan latency > 1s

---

## 📋 **Implementation Checklist**

### **Backend**
- [ ] Create database migrations for new tables
- [ ] Implement `PaymentQRToken` entity and repository
- [ ] Implement `QRScanAuditLog` entity and repository
- [ ] Implement `QRTokenService` with JWT generation
- [ ] Implement `QRPaymentService` with scan/confirm logic
- [ ] Create `QRPaymentController` with endpoints
- [ ] Add rate limiting to QR endpoints
- [ ] Implement RBAC for QR endpoints
- [ ] Add comprehensive logging
- [ ] Write unit tests for all services
- [ ] Write integration tests for API endpoints

### **Frontend - Customer App**
- [ ] Create `QRCodeDisplay.vue` component
- [ ] Add QR code generation library (qrcode)
- [ ] Update order confirmation page to show QR
- [ ] Implement QR refresh on expiry
- [ ] Add short code display and copy
- [ ] Handle WebSocket updates for payment status
- [ ] Add offline state handling
- [ ] Write component tests

### **Frontend - Admin POS**
- [ ] Create `QRScannerModal.vue` component
- [ ] Add QR scanner library (html5-qrcode)
- [ ] Implement camera access and QR scanning
- [ ] Create `OrderDetailModal.vue` for scanned orders
- [ ] Implement payment confirmation UI
- [ ] Add offline queue for confirmations
- [ ] Implement offline sync on reconnect
- [ ] Add manual short code entry
- [ ] Write component tests

### **Security**
- [ ] Configure JWT secret in environment variables
- [ ] Implement rate limiting middleware
- [ ] Add device fingerprinting
- [ ] Implement replay protection
- [ ] Add RBAC checks
- [ ] Security audit
- [ ] Penetration testing

### **Testing**
- [ ] Write E2E tests for all acceptance criteria
- [ ] Load testing for QR endpoints
- [ ] Offline scenario testing
- [ ] Security testing (expired, replayed, invalid tokens)
- [ ] Cross-device testing
- [ ] Performance testing

### **Documentation**
- [ ] API documentation for QR endpoints
- [ ] User guide for cashiers
- [ ] Troubleshooting guide
- [ ] Security best practices
- [ ] Deployment guide

---

## 🚀 **Deployment Plan**

### **Phase 1: Development (Week 1-2)**
- Backend implementation
- Database migrations
- Unit tests

### **Phase 2: Frontend (Week 2-3)**
- Customer app QR display
- Admin POS scanner
- Offline sync

### **Phase 3: Testing (Week 3-4)**
- Integration testing
- E2E testing
- Security testing
- Performance testing

### **Phase 4: Staging (Week 4)**
- Deploy to staging
- User acceptance testing
- Bug fixes
- Documentation

### **Phase 5: Production (Week 5)**
- Production deployment
- Monitor metrics
- Gradual rollout (10%, 50%, 100%)
- Staff training

---

## 📞 **Support & Maintenance**

### **Monitoring**
- Set up Grafana dashboards for QR metrics
- Configure alerts for critical errors
- Daily review of audit logs

### **Troubleshooting**
- Document common issues and solutions
- Create runbook for emergency scenarios
- 24/7 support contact

---

**Document Version:** 1.0
**Last Updated:** November 2, 2025
**Status:** Ready for Implementation

---

## 🔗 **Related Documents**

- [System Analysis](SYSTEM_ANALYSIS.md)
- [API Documentation](API_CONTRACTS.md)
- [Security Specifications](SECURITY.md)
- [Offline Sync Guide](OFFLINE_SYNC.md)
