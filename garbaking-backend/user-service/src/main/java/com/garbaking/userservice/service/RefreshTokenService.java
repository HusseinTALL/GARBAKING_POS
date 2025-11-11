package com.garbaking.userservice.service;

import com.garbaking.userservice.exception.ResourceNotFoundException;
import com.garbaking.userservice.model.RefreshToken;
import com.garbaking.userservice.model.User;
import com.garbaking.userservice.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Refresh Token Service
 *
 * Manages refresh token lifecycle: creation, validation, and revocation.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh.expiration:604800000}") // 7 days in milliseconds
    private long refreshTokenExpiration;

    @Value("${jwt.refresh.max-per-user:5}") // Maximum active refresh tokens per user
    private int maxTokensPerUser;

    /**
     * Generate new refresh token for user
     */
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        log.info("Creating refresh token for user: {}", user.getEmail());

        // Check token limit per user
        long activeTokens = refreshTokenRepository.countValidTokensByUser(user, Instant.now());
        if (activeTokens >= maxTokensPerUser) {
            log.warn("User {} has reached maximum refresh tokens ({}), revoking oldest", user.getEmail(), maxTokensPerUser);
            // Revoke all existing tokens for this user
            refreshTokenRepository.revokeAllTokensByUser(user, Instant.now());
        }

        // Generate unique token
        String tokenValue = UUID.randomUUID().toString();

        // Create refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(Instant.now().plusMillis(refreshTokenExpiration))
                .revoked(false)
                .build();

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.info("Refresh token created successfully for user: {}", user.getEmail());

        return saved;
    }

    /**
     * Verify and get refresh token
     */
    @Transactional(readOnly = true)
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            log.warn("Attempted to use revoked refresh token for user: {}", refreshToken.getUser().getEmail());
            throw new IllegalStateException("Refresh token has been revoked");
        }

        if (refreshToken.isExpired()) {
            log.warn("Attempted to use expired refresh token for user: {}", refreshToken.getUser().getEmail());
            // Auto-delete expired token
            refreshTokenRepository.delete(refreshToken);
            throw new IllegalStateException("Refresh token has expired. Please login again.");
        }

        return refreshToken;
    }

    /**
     * Revoke a specific refresh token
     */
    @Transactional
    public void revokeRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        if (!refreshToken.isRevoked()) {
            refreshToken.setRevoked(true);
            refreshToken.setRevokedAt(Instant.now());
            refreshTokenRepository.save(refreshToken);
            log.info("Refresh token revoked for user: {}", refreshToken.getUser().getEmail());
        }
    }

    /**
     * Revoke all refresh tokens for a user (logout from all devices)
     */
    @Transactional
    public void revokeAllUserTokens(User user) {
        log.info("Revoking all refresh tokens for user: {}", user.getEmail());
        refreshTokenRepository.revokeAllTokensByUser(user, Instant.now());
    }

    /**
     * Delete all expired tokens (cleanup job)
     */
    @Transactional
    public void deleteExpiredTokens() {
        log.info("Deleting expired refresh tokens");
        refreshTokenRepository.deleteExpiredTokens(Instant.now());
    }

    /**
     * Get user from refresh token
     */
    @Transactional(readOnly = true)
    public User getUserFromRefreshToken(String token) {
        RefreshToken refreshToken = verifyRefreshToken(token);
        return refreshToken.getUser();
    }

    /**
     * Get count of active (non-revoked, non-expired) refresh tokens
     * Used for monitoring and statistics
     */
    @Transactional(readOnly = true)
    public long getActiveTokenCount() {
        return refreshTokenRepository.countByRevokedFalseAndExpiryDateAfter(Instant.now());
    }
}
