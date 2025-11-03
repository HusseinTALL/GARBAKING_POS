package com.garbaking.orderservice.repository;

import com.garbaking.orderservice.model.PaymentQRToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for PaymentQRToken entity
 *
 * Provides data access for QR payment tokens including
 * lookups by various identifiers and cleanup of expired tokens.
 */
@Repository
public interface PaymentQRTokenRepository extends JpaRepository<PaymentQRToken, Long> {

    /**
     * Find token by unique token ID
     * @param tokenId The JWT token identifier (jti claim)
     * @return Optional containing the token if found
     */
    Optional<PaymentQRToken> findByTokenId(String tokenId);

    /**
     * Find token by short code
     * @param shortCode The 6-8 character fallback code
     * @return Optional containing the token if found
     */
    Optional<PaymentQRToken> findByShortCode(String shortCode);

    /**
     * Find token by order ID
     * @param orderId The order ID
     * @return Optional containing the token if found
     */
    Optional<PaymentQRToken> findByOrderId(Long orderId);

    /**
     * Find all tokens for an order (including expired/used)
     * Useful for audit trail
     * @param orderId The order ID
     * @return List of all tokens for the order
     */
    List<PaymentQRToken> findAllByOrderId(Long orderId);

    /**
     * Find all unused and non-expired tokens for an order
     * @param orderId The order ID
     * @param now Current timestamp
     * @return List of valid tokens
     */
    @Query("SELECT t FROM PaymentQRToken t WHERE t.orderId = :orderId " +
           "AND t.isUsed = false AND t.expiresAt > :now")
    List<PaymentQRToken> findValidTokensByOrderId(
            @Param("orderId") Long orderId,
            @Param("now") LocalDateTime now
    );

    /**
     * Find all expired tokens that haven't been used
     * Useful for cleanup tasks
     * @param now Current timestamp
     * @return List of expired unused tokens
     */
    @Query("SELECT t FROM PaymentQRToken t WHERE t.isUsed = false " +
           "AND t.expiresAt < :now")
    List<PaymentQRToken> findExpiredUnusedTokens(@Param("now") LocalDateTime now);

    /**
     * Find all used tokens by device ID
     * Useful for analytics and audit
     * @param deviceId Device identifier
     * @return List of tokens used by the device
     */
    List<PaymentQRToken> findByUsedByDeviceId(String deviceId);

    /**
     * Find all used tokens by user ID
     * Useful for analytics and audit
     * @param userId User identifier
     * @return List of tokens used by the user
     */
    List<PaymentQRToken> findByUsedByUserId(Long userId);

    /**
     * Count tokens created today
     * Useful for daily metrics
     * @param startOfDay Start of current day
     * @param endOfDay End of current day
     * @return Count of tokens created today
     */
    @Query("SELECT COUNT(t) FROM PaymentQRToken t WHERE " +
           "t.createdAt >= :startOfDay AND t.createdAt < :endOfDay")
    Long countTokensCreatedToday(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    /**
     * Count tokens used today
     * Useful for adoption metrics
     * @param startOfDay Start of current day
     * @param endOfDay End of current day
     * @return Count of tokens used today
     */
    @Query("SELECT COUNT(t) FROM PaymentQRToken t WHERE t.isUsed = true " +
           "AND t.usedAt >= :startOfDay AND t.usedAt < :endOfDay")
    Long countTokensUsedToday(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    /**
     * Delete expired tokens older than specified date
     * Used for database cleanup
     * @param beforeDate Only delete tokens that expired before this date
     * @return Number of records deleted
     */
    @Query("DELETE FROM PaymentQRToken t WHERE t.expiresAt < :beforeDate")
    int deleteExpiredTokens(@Param("beforeDate") LocalDateTime beforeDate);
}
