package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.AlertSeverity;
import com.garbaking.operationsservice.model.VarianceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VarianceAlertRepository extends JpaRepository<VarianceAlert, Long> {

    /**
     * Find all unresolved alerts
     */
    List<VarianceAlert> findByResolvedFalseOrderByCreatedAtDesc();

    /**
     * Find unacknowledged alerts
     */
    List<VarianceAlert> findByAcknowledgedFalseOrderByCreatedAtDesc();

    /**
     * Find alerts by severity
     */
    List<VarianceAlert> findBySeverityOrderByCreatedAtDesc(AlertSeverity severity);

    /**
     * Find alerts by session
     */
    List<VarianceAlert> findBySessionIdOrderByCreatedAtDesc(Long sessionId);

    /**
     * Find alerts within date range
     */
    @Query("SELECT a FROM VarianceAlert a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    List<VarianceAlert> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    /**
     * Find high priority unresolved alerts
     */
    @Query("SELECT a FROM VarianceAlert a WHERE a.resolved = false AND a.severity IN ('HIGH', 'CRITICAL') ORDER BY a.severity DESC, a.createdAt DESC")
    List<VarianceAlert> findHighPriorityUnresolved();

    /**
     * Count unresolved alerts
     */
    long countByResolvedFalse();

    /**
     * Count unacknowledged alerts
     */
    long countByAcknowledgedFalse();
}
