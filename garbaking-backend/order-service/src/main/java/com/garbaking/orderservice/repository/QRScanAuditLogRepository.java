package com.garbaking.orderservice.repository;

import com.garbaking.orderservice.model.QRScanAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for QRScanAuditLog entity
 *
 * Provides data access for QR scan audit logs including
 * analytics queries and security event tracking.
 */
@Repository
public interface QRScanAuditLogRepository extends JpaRepository<QRScanAuditLog, Long> {

    /**
     * Find all audit logs for a specific order
     * @param orderId The order ID
     * @return List of audit logs
     */
    List<QRScanAuditLog> findByOrderIdOrderByScanTimestampDesc(Long orderId);

    /**
     * Find all audit logs for a specific token
     * @param tokenId The token ID
     * @return List of audit logs
     */
    List<QRScanAuditLog> findByTokenIdOrderByScanTimestampDesc(String tokenId);

    /**
     * Find all audit logs for a specific device
     * @param deviceId The device ID
     * @return List of audit logs
     */
    List<QRScanAuditLog> findByDeviceIdOrderByScanTimestampDesc(String deviceId);

    /**
     * Find all audit logs for a specific user
     * @param userId The user ID
     * @return List of audit logs
     */
    List<QRScanAuditLog> findByUserIdOrderByScanTimestampDesc(Long userId);

    /**
     * Find logs by action type
     * @param action Action type (SCAN, CONFIRM_PAYMENT, etc.)
     * @return List of audit logs
     */
    List<QRScanAuditLog> findByActionOrderByScanTimestampDesc(String action);

    /**
     * Find logs by status
     * @param status Status (SUCCESS, FAILED, etc.)
     * @return List of audit logs
     */
    List<QRScanAuditLog> findByStatusOrderByScanTimestampDesc(String status);

    /**
     * Find failed attempts
     * Useful for security monitoring
     * @param startTime Start of time range
     * @param endTime End of time range
     * @return List of failed attempts
     */
    @Query("SELECT l FROM QRScanAuditLog l WHERE l.status != 'SUCCESS' " +
           "AND l.scanTimestamp >= :startTime AND l.scanTimestamp < :endTime " +
           "ORDER BY l.scanTimestamp DESC")
    List<QRScanAuditLog> findFailedAttempts(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Find successful payment confirmations
     * @param startTime Start of time range
     * @param endTime End of time range
     * @return List of successful confirmations
     */
    @Query("SELECT l FROM QRScanAuditLog l WHERE l.action = 'CONFIRM_PAYMENT' " +
           "AND l.status = 'SUCCESS' " +
           "AND l.scanTimestamp >= :startTime AND l.scanTimestamp < :endTime " +
           "ORDER BY l.scanTimestamp DESC")
    List<QRScanAuditLog> findSuccessfulPaymentConfirmations(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Count scans by device within time period
     * Useful for rate limiting analysis
     * @param deviceId Device ID
     * @param since Start of time period
     * @return Count of scans
     */
    @Query("SELECT COUNT(l) FROM QRScanAuditLog l WHERE l.deviceId = :deviceId " +
           "AND l.action = 'SCAN' AND l.scanTimestamp >= :since")
    Long countScansByDeviceSince(
            @Param("deviceId") String deviceId,
            @Param("since") LocalDateTime since
    );

    /**
     * Get average processing time for successful scans
     * @param startTime Start of time range
     * @param endTime End of time range
     * @return Average processing time in milliseconds
     */
    @Query("SELECT AVG(l.processingTimeMs) FROM QRScanAuditLog l " +
           "WHERE l.action = 'SCAN' AND l.status = 'SUCCESS' " +
           "AND l.scanTimestamp >= :startTime AND l.scanTimestamp < :endTime")
    Double getAverageScanProcessingTime(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Get average processing time for payment confirmations
     * @param startTime Start of time range
     * @param endTime End of time range
     * @return Average processing time in milliseconds
     */
    @Query("SELECT AVG(l.processingTimeMs) FROM QRScanAuditLog l " +
           "WHERE l.action = 'CONFIRM_PAYMENT' AND l.status = 'SUCCESS' " +
           "AND l.scanTimestamp >= :startTime AND l.scanTimestamp < :endTime")
    Double getAverageConfirmProcessingTime(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Count successful vs failed scans in time period
     * Useful for success rate metrics
     * @param startTime Start of time range
     * @param endTime End of time range
     * @param status Status to count
     * @return Count of logs with given status
     */
    @Query("SELECT COUNT(l) FROM QRScanAuditLog l WHERE l.action = 'SCAN' " +
           "AND l.status = :status " +
           "AND l.scanTimestamp >= :startTime AND l.scanTimestamp < :endTime")
    Long countScansByStatus(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("status") String status
    );

    /**
     * Find security events (unauthorized, invalid, duplicate attempts)
     * @param startTime Start of time range
     * @param endTime End of time range
     * @return List of security events
     */
    @Query("SELECT l FROM QRScanAuditLog l WHERE l.status IN ('UNAUTHORIZED', 'INVALID', 'DUPLICATE', 'EXPIRED') " +
           "AND l.scanTimestamp >= :startTime AND l.scanTimestamp < :endTime " +
           "ORDER BY l.scanTimestamp DESC")
    List<QRScanAuditLog> findSecurityEvents(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Get payment method distribution
     * @param startTime Start of time range
     * @param endTime End of time range
     * @return List of objects with payment method and count
     */
    @Query("SELECT l.paymentMethod, COUNT(l) FROM QRScanAuditLog l " +
           "WHERE l.action = 'CONFIRM_PAYMENT' AND l.status = 'SUCCESS' " +
           "AND l.scanTimestamp >= :startTime AND l.scanTimestamp < :endTime " +
           "GROUP BY l.paymentMethod")
    List<Object[]> getPaymentMethodDistribution(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Delete old audit logs (data retention cleanup)
     * @param beforeDate Only delete logs older than this date
     * @return Number of records deleted
     */
    @Query("DELETE FROM QRScanAuditLog l WHERE l.createdAt < :beforeDate")
    int deleteOldLogs(@Param("beforeDate") LocalDateTime beforeDate);
}
