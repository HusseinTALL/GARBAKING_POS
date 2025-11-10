package com.garbaking.userservice.security;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate Limiting Service
 *
 * Implements rate limiting for authentication endpoints to prevent:
 * - Brute force attacks
 * - Credential stuffing
 * - Account enumeration
 * - Resource exhaustion
 *
 * Uses Google Guava Cache for in-memory rate limit tracking.
 */
@Service
@Slf4j
public class RateLimitService {

    // Login attempts: 5 attempts per 15 minutes per IP
    @Value("${security.rate-limit.login.max-attempts:5}")
    private int loginMaxAttempts;

    @Value("${security.rate-limit.login.window-minutes:15}")
    private int loginWindowMinutes;

    // Registration attempts: 3 attempts per hour per IP
    @Value("${security.rate-limit.register.max-attempts:3}")
    private int registerMaxAttempts;

    @Value("${security.rate-limit.register.window-minutes:60}")
    private int registerWindowMinutes;

    // Refresh token attempts: 10 attempts per minute per IP
    @Value("${security.rate-limit.refresh.max-attempts:10}")
    private int refreshMaxAttempts;

    @Value("${security.rate-limit.refresh.window-minutes:1}")
    private int refreshWindowMinutes;

    // Cache for tracking attempts
    private final Cache<String, AtomicInteger> loginAttempts;
    private final Cache<String, AtomicInteger> registerAttempts;
    private final Cache<String, AtomicInteger> refreshAttempts;

    public RateLimitService(
            @Value("${security.rate-limit.login.window-minutes:15}") int loginWindowMinutes,
            @Value("${security.rate-limit.register.window-minutes:60}") int registerWindowMinutes,
            @Value("${security.rate-limit.refresh.window-minutes:1}") int refreshWindowMinutes
    ) {
        this.loginAttempts = CacheBuilder.newBuilder()
                .expireAfterWrite(loginWindowMinutes, TimeUnit.MINUTES)
                .build();

        this.registerAttempts = CacheBuilder.newBuilder()
                .expireAfterWrite(registerWindowMinutes, TimeUnit.MINUTES)
                .build();

        this.refreshAttempts = CacheBuilder.newBuilder()
                .expireAfterWrite(refreshWindowMinutes, TimeUnit.MINUTES)
                .build();
    }

    /**
     * Check if login attempt is allowed for the given IP
     */
    public boolean isLoginAllowed(String ipAddress) {
        return isAllowed(loginAttempts, ipAddress, loginMaxAttempts, "login");
    }

    /**
     * Record a login attempt
     */
    public void recordLoginAttempt(String ipAddress) {
        recordAttempt(loginAttempts, ipAddress, "login");
    }

    /**
     * Reset login attempts for IP (after successful login)
     */
    public void resetLoginAttempts(String ipAddress) {
        loginAttempts.invalidate(ipAddress);
        log.debug("Reset login attempts for IP: {}", ipAddress);
    }

    /**
     * Check if registration attempt is allowed for the given IP
     */
    public boolean isRegisterAllowed(String ipAddress) {
        return isAllowed(registerAttempts, ipAddress, registerMaxAttempts, "register");
    }

    /**
     * Record a registration attempt
     */
    public void recordRegisterAttempt(String ipAddress) {
        recordAttempt(registerAttempts, ipAddress, "register");
    }

    /**
     * Check if refresh token attempt is allowed for the given IP
     */
    public boolean isRefreshAllowed(String ipAddress) {
        return isAllowed(refreshAttempts, ipAddress, refreshMaxAttempts, "refresh");
    }

    /**
     * Record a refresh token attempt
     */
    public void recordRefreshAttempt(String ipAddress) {
        recordAttempt(refreshAttempts, ipAddress, "refresh");
    }

    /**
     * Generic method to check if attempt is allowed
     */
    private boolean isAllowed(Cache<String, AtomicInteger> cache, String key, int maxAttempts, String operation) {
        AtomicInteger attempts = cache.getIfPresent(key);
        if (attempts == null) {
            return true;
        }

        int currentAttempts = attempts.get();
        boolean allowed = currentAttempts < maxAttempts;

        if (!allowed) {
            log.warn("Rate limit exceeded for {} operation from: {}, attempts: {}/{}",
                    operation, key, currentAttempts, maxAttempts);
        }

        return allowed;
    }

    /**
     * Generic method to record an attempt
     */
    private void recordAttempt(Cache<String, AtomicInteger> cache, String key, String operation) {
        AtomicInteger attempts = cache.getIfPresent(key);
        if (attempts == null) {
            attempts = new AtomicInteger(0);
            cache.put(key, attempts);
        }
        int newCount = attempts.incrementAndGet();
        log.debug("Recorded {} attempt from: {}, total: {}", operation, key, newCount);
    }

    /**
     * Get current attempt count for login
     */
    public int getLoginAttempts(String ipAddress) {
        AtomicInteger attempts = loginAttempts.getIfPresent(ipAddress);
        return attempts != null ? attempts.get() : 0;
    }

    /**
     * Get current attempt count for register
     */
    public int getRegisterAttempts(String ipAddress) {
        AtomicInteger attempts = registerAttempts.getIfPresent(ipAddress);
        return attempts != null ? attempts.get() : 0;
    }

    /**
     * Get statistics for monitoring
     */
    public RateLimitStats getStats() {
        return RateLimitStats.builder()
                .loginCacheSize(loginAttempts.size())
                .registerCacheSize(registerAttempts.size())
                .refreshCacheSize(refreshAttempts.size())
                .loginMaxAttempts(loginMaxAttempts)
                .registerMaxAttempts(registerMaxAttempts)
                .refreshMaxAttempts(refreshMaxAttempts)
                .build();
    }

    /**
     * Statistics DTO
     */
    @lombok.Builder
    @lombok.Data
    public static class RateLimitStats {
        private long loginCacheSize;
        private long registerCacheSize;
        private long refreshCacheSize;
        private int loginMaxAttempts;
        private int registerMaxAttempts;
        private int refreshMaxAttempts;
    }
}
