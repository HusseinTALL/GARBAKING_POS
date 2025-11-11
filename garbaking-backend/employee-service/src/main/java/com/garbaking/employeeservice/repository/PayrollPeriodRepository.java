package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.PayrollPeriod;
import com.garbaking.employeeservice.model.PayrollStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Payroll Period operations
 */
@Repository
public interface PayrollPeriodRepository extends JpaRepository<PayrollPeriod, Long> {

    /**
     * Find all payroll periods ordered by start date
     */
    @Query("SELECT pp FROM PayrollPeriod pp ORDER BY pp.startDate DESC")
    List<PayrollPeriod> findAllOrderByStartDateDesc();

    /**
     * Find payroll periods by status
     */
    List<PayrollPeriod> findByStatusOrderByStartDateDesc(PayrollStatus status);

    /**
     * Find payroll period containing a specific date
     */
    @Query("SELECT pp FROM PayrollPeriod pp WHERE :date BETWEEN pp.startDate AND pp.endDate")
    Optional<PayrollPeriod> findByDateInPeriod(@Param("date") LocalDate date);

    /**
     * Find payroll periods within a date range
     */
    @Query("SELECT pp FROM PayrollPeriod pp WHERE " +
            "(pp.startDate BETWEEN :startDate AND :endDate) OR " +
            "(pp.endDate BETWEEN :startDate AND :endDate) OR " +
            "(pp.startDate <= :startDate AND pp.endDate >= :endDate) " +
            "ORDER BY pp.startDate DESC")
    List<PayrollPeriod> findPeriodsInRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find current payroll period (contains today's date)
     */
    @Query("SELECT pp FROM PayrollPeriod pp WHERE :today BETWEEN pp.startDate AND pp.endDate")
    Optional<PayrollPeriod> findCurrentPeriod(@Param("today") LocalDate today);

    /**
     * Find recent payroll periods (last 6 months)
     */
    @Query("SELECT pp FROM PayrollPeriod pp WHERE pp.startDate >= :sixMonthsAgo " +
            "ORDER BY pp.startDate DESC")
    List<PayrollPeriod> findRecentPeriods(@Param("sixMonthsAgo") LocalDate sixMonthsAgo);

    /**
     * Count periods by status
     */
    Long countByStatus(PayrollStatus status);
}
