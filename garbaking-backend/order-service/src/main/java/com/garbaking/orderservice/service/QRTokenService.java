package com.garbaking.orderservice.service;

import com.garbaking.orderservice.dto.QRTokenResponseDTO;
import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.model.PaymentQRToken;
import com.garbaking.orderservice.repository.PaymentQRTokenRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
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
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

/**
 * Service for generating and validating QR payment tokens
 *
 * Handles JWT-based token creation with HMAC-SHA256 signing,
 * replay protection via nonce, and short code generation for fallback.
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

    @Value("${qr.token.audience:payment-confirmation}")
    private String audience;

    /**
     * Generate QR token for an order
     *
     * @param order The order to generate token for
     * @return QRTokenResponseDTO with token and metadata
     */
    @Transactional
    public QRTokenResponseDTO generateToken(Order order) {
        log.info("Generating QR token for order: {}", order.getOrderNumber());

        try {
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
                    .setAudience(audience)
                    .setSubject("order_" + order.getId())
                    .setIssuedAt(Date.from(now.atZone(ZoneId.systemDefault()).toInstant()))
                    .setExpiration(Date.from(expiresAt.atZone(ZoneId.systemDefault()).toInstant()))
                    .claim("order_id", order.getId())
                    .claim("order_number", order.getOrderNumber())
                    .claim("nonce", nonce)
                    .claim("amount", order.getTotalAmount().toString())
                    .claim("currency", "XOF")
                    .claim("short_code", shortCode)
                    .claim("v", 1) // Token version
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

            log.info("QR token generated successfully: {} (expires at: {})", tokenId, expiresAt);

            // Calculate seconds until expiry
            long expiresInSeconds = ChronoUnit.SECONDS.between(now, expiresAt);

            // Return response DTO
            return QRTokenResponseDTO.builder()
                    .qrToken(token)
                    .tokenId(tokenId)
                    .shortCode(shortCode)
                    .issuedAt(now)
                    .expiresAt(expiresAt)
                    .expiresInSeconds(expiresInSeconds)
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate QR token for order {}: {}", order.getOrderNumber(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate QR token", e);
        }
    }

    /**
     * Validate and decode QR token
     *
     * @param token The JWT token string
     * @return Claims from the token if valid
     * @throws InvalidTokenException if token is invalid, expired, or already used
     */
    public Claims validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

            // Parse and validate JWT
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .requireIssuer(issuer)
                    .requireAudience(audience)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Check if token exists in database
            String tokenId = claims.getId();
            PaymentQRToken qrToken = tokenRepository.findByTokenId(tokenId)
                    .orElseThrow(() -> new InvalidTokenException("Token not found in database"));

            // Check if token is already used
            if (qrToken.getIsUsed()) {
                log.warn("Attempt to use already-used token: {}", tokenId);
                throw new InvalidTokenException("Token already used");
            }

            // Check if token is expired (double-check beyond JWT expiry)
            if (qrToken.isExpired()) {
                log.warn("Token expired: {}", tokenId);
                throw new InvalidTokenException("Token expired");
            }

            // Verify nonce matches
            String nonce = claims.get("nonce", String.class);
            if (!qrToken.getNonce().equals(nonce)) {
                log.error("Nonce mismatch for token: {}", tokenId);
                throw new InvalidTokenException("Nonce mismatch - possible replay attack");
            }

            log.info("Token validated successfully: {}", tokenId);
            return claims;

        } catch (ExpiredJwtException e) {
            log.warn("Token expired: {}", e.getMessage());
            throw new InvalidTokenException("Token expired");
        } catch (SignatureException e) {
            log.error("Invalid token signature: {}", e.getMessage());
            throw new InvalidTokenException("Invalid token signature");
        } catch (JwtException e) {
            log.error("Invalid token: {}", e.getMessage());
            throw new InvalidTokenException("Invalid token: " + e.getMessage());
        }
    }

    /**
     * Mark token as used
     *
     * @param tokenId The token ID to mark as used
     * @param userId User who used the token
     * @param deviceId Device that used the token
     */
    @Transactional
    public void markTokenUsed(String tokenId, Long userId, String deviceId) {
        PaymentQRToken token = tokenRepository.findByTokenId(tokenId)
                .orElseThrow(() -> new InvalidTokenException("Token not found"));

        if (token.getIsUsed()) {
            throw new InvalidTokenException("Token already marked as used");
        }

        token.markAsUsed(userId, deviceId);
        tokenRepository.save(token);

        log.info("Token marked as used: {} by user {} on device {}", tokenId, userId, deviceId);
    }

    /**
     * Validate token by short code
     *
     * @param shortCode The 6-8 character short code
     * @return PaymentQRToken if valid
     * @throws InvalidTokenException if code is invalid, expired, or used
     */
    public PaymentQRToken validateByShortCode(String shortCode) {
        PaymentQRToken token = tokenRepository.findByShortCode(shortCode.toUpperCase())
                .orElseThrow(() -> new InvalidTokenException("Invalid short code"));

        if (token.getIsUsed()) {
            log.warn("Attempt to use already-used short code: {}", shortCode);
            throw new InvalidTokenException("Short code already used");
        }

        if (token.isExpired()) {
            log.warn("Short code expired: {}", shortCode);
            throw new InvalidTokenException("Short code expired");
        }

        log.info("Short code validated successfully: {}", shortCode);
        return token;
    }

    /**
     * Get token info by order ID
     *
     * @param orderId The order ID
     * @return QRTokenResponseDTO if token exists and is valid
     */
    public QRTokenResponseDTO getTokenByOrderId(Long orderId) {
        LocalDateTime now = LocalDateTime.now();

        return tokenRepository.findValidTokensByOrderId(orderId, now).stream()
                .findFirst()
                .map(token -> {
                    long expiresInSeconds = ChronoUnit.SECONDS.between(now, token.getExpiresAt());

                    return QRTokenResponseDTO.builder()
                            .tokenId(token.getTokenId())
                            .shortCode(token.getShortCode())
                            .issuedAt(token.getIssuedAt())
                            .expiresAt(token.getExpiresAt())
                            .expiresInSeconds(expiresInSeconds)
                            .orderId(token.getOrderId())
                            .build();
                })
                .orElse(null);
    }

    /**
     * Generate random 6-8 character short code
     * Format: "QR" + 6 random alphanumeric characters
     * Excludes ambiguous characters (0, O, I, 1, etc.)
     *
     * @return Short code string
     */
    private String generateShortCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars
        StringBuilder code = new StringBuilder("QR");

        // Generate 6 random characters
        for (int i = 0; i < 6; i++) {
            int index = (int) (Math.random() * chars.length());
            code.append(chars.charAt(index));
        }

        // Ensure uniqueness
        String shortCode = code.toString();
        while (tokenRepository.findByShortCode(shortCode).isPresent()) {
            // Regenerate if collision (very unlikely)
            code = new StringBuilder("QR");
            for (int i = 0; i < 6; i++) {
                int index = (int) (Math.random() * chars.length());
                code.append(chars.charAt(index));
            }
            shortCode = code.toString();
        }

        return shortCode;
    }

    /**
     * Hash token using SHA-256 for storage verification
     *
     * @param token The token to hash
     * @return Hexadecimal hash string
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }

    /**
     * Custom exception for invalid tokens
     */
    public static class InvalidTokenException extends RuntimeException {
        public InvalidTokenException(String message) {
            super(message);
        }
    }
}
