package com.garbaking.userservice.task;

import com.garbaking.userservice.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Authentication Scheduled Tasks
 *
 * Background jobs for authentication system maintenance:
 * - Token cleanup (expired tokens)
 * - Session monitoring
 * - Security metrics collection
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationScheduledTasks {

    private final RefreshTokenService refreshTokenService;

    /**
     * Clean up expired refresh tokens
     * Runs daily at 2:00 AM
     *
     * Cron expression: "0 0 2 * * *" = Second Minute Hour Day Month Weekday
     * - 0: At second 0
     * - 0: At minute 0
     * - 2: At hour 2 (2 AM)
     * - *: Every day
     * - *: Every month
     * - *: Every day of week
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupExpiredTokens() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        log.info("[SCHEDULED TASK] Starting expired token cleanup at {}", timestamp);

        try {
            refreshTokenService.deleteExpiredTokens();
            log.info("[SCHEDULED TASK] Expired token cleanup completed successfully");
        } catch (Exception e) {
            log.error("[SCHEDULED TASK] Failed to cleanup expired tokens: {}", e.getMessage(), e);
        }
    }

    /**
     * Log token statistics
     * Runs every hour
     *
     * Provides insights into token usage for monitoring
     */
    @Scheduled(cron = "0 0 * * * *")
    public void logTokenStatistics() {
        try {
            long activeTokenCount = refreshTokenService.getActiveTokenCount();
            log.info("[TOKEN STATS] Active refresh tokens: {}", activeTokenCount);
        } catch (Exception e) {
            log.error("[TOKEN STATS] Failed to collect token statistics: {}", e.getMessage());
        }
    }

    /**
     * Health check for scheduled tasks
     * Runs every 15 minutes
     *
     * Confirms that scheduling is working properly
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void scheduledTaskHealthCheck() {
        log.debug("[HEALTH CHECK] Scheduled tasks are running normally");
    }
}
