package com.garbaking.userservice.repository;

import com.garbaking.userservice.model.RefreshToken;
import com.garbaking.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Refresh Token Repository
 *
 * Data access layer for refresh tokens.
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Find refresh token by token string
     */
    Optional<RefreshToken> findByToken(String token);

    /**
     * Find all valid (non-revoked, non-expired) tokens for a user
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user AND rt.revoked = false AND rt.expiryDate > :now")
    List<RefreshToken> findValidTokensByUser(@Param("user") User user, @Param("now") Instant now);

    /**
     * Revoke all tokens for a user (for logout all devices)
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true, rt.revokedAt = :now WHERE rt.user = :user AND rt.revoked = false")
    void revokeAllTokensByUser(@Param("user") User user, @Param("now") Instant now);

    /**
     * Delete all tokens for a user
     */
    void deleteByUser(User user);

    /**
     * Delete expired tokens (for cleanup job)
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now")
    void deleteExpiredTokens(@Param("now") Instant now);

    /**
     * Count valid tokens for user
     */
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.user = :user AND rt.revoked = false AND rt.expiryDate > :now")
    long countValidTokensByUser(@Param("user") User user, @Param("now") Instant now);
}
