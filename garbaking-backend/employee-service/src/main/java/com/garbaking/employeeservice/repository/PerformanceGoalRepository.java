package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.GoalStatus;
import com.garbaking.employeeservice.model.PerformanceGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for Performance Goal operations
 */
@Repository
public interface PerformanceGoalRepository extends JpaRepository<PerformanceGoal, Long> {

    /**
     * Find all goals for an employee
     */
    @Query("SELECT pg FROM PerformanceGoal pg WHERE pg.employee.id = :employeeId " +
            "ORDER BY pg.dueDate ASC")
    List<PerformanceGoal> findByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Find goals by status
     */
    List<PerformanceGoal> findByStatusOrderByDueDateAsc(GoalStatus status);

    /**
     * Find active goals for an employee (not completed or cancelled)
     */
    @Query("SELECT pg FROM PerformanceGoal pg WHERE pg.employee.id = :employeeId " +
            "AND pg.status NOT IN ('COMPLETED', 'CANCELLED') " +
            "ORDER BY pg.dueDate ASC")
    List<PerformanceGoal> findActiveGoalsByEmployee(@Param("employeeId") Long employeeId);

    /**
     * Find overdue goals
     */
    @Query("SELECT pg FROM PerformanceGoal pg WHERE pg.dueDate < :today " +
            "AND pg.status NOT IN ('COMPLETED', 'CANCELLED') " +
            "ORDER BY pg.dueDate ASC")
    List<PerformanceGoal> findOverdueGoals(@Param("today") LocalDate today);

    /**
     * Find goals due soon (within next 7 days)
     */
    @Query("SELECT pg FROM PerformanceGoal pg WHERE pg.dueDate BETWEEN :today AND :weekFromNow " +
            "AND pg.status NOT IN ('COMPLETED', 'CANCELLED') " +
            "ORDER BY pg.dueDate ASC")
    List<PerformanceGoal> findGoalsDueSoon(
            @Param("today") LocalDate today,
            @Param("weekFromNow") LocalDate weekFromNow
    );

    /**
     * Find goals by employee and status
     */
    @Query("SELECT pg FROM PerformanceGoal pg WHERE pg.employee.id = :employeeId " +
            "AND pg.status = :status ORDER BY pg.dueDate ASC")
    List<PerformanceGoal> findByEmployeeIdAndStatus(
            @Param("employeeId") Long employeeId,
            @Param("status") GoalStatus status
    );

    /**
     * Count goals by status
     */
    Long countByStatus(GoalStatus status);

    /**
     * Get completion rate for an employee
     */
    @Query("SELECT (COUNT(CASE WHEN pg.status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(*)) " +
            "FROM PerformanceGoal pg WHERE pg.employee.id = :employeeId")
    Double getCompletionRateByEmployeeId(@Param("employeeId") Long employeeId);
}
