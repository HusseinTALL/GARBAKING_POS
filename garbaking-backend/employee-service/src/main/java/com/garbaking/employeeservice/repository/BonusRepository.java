package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.Bonus;
import com.garbaking.employeeservice.model.BonusType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Repository for Bonus operations
 */
@Repository
public interface BonusRepository extends JpaRepository<Bonus, Long> {

    /**
     * Find all bonuses for a payroll entry
     */
    @Query("SELECT b FROM Bonus b WHERE b.payrollEntry.id = :payrollEntryId " +
            "ORDER BY b.bonusDate DESC")
    List<Bonus> findByPayrollEntryId(@Param("payrollEntryId") Long payrollEntryId);

    /**
     * Find all bonuses for an employee
     */
    @Query("SELECT b FROM Bonus b WHERE b.employee.id = :employeeId " +
            "ORDER BY b.bonusDate DESC")
    List<Bonus> findByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Find unpaid bonuses
     */
    @Query("SELECT b FROM Bonus b WHERE b.isPaid = false ORDER BY b.bonusDate ASC")
    List<Bonus> findUnpaidBonuses();

    /**
     * Find unpaid bonuses for an employee
     */
    @Query("SELECT b FROM Bonus b WHERE b.employee.id = :employeeId " +
            "AND b.isPaid = false ORDER BY b.bonusDate ASC")
    List<Bonus> findUnpaidBonusesByEmployee(@Param("employeeId") Long employeeId);

    /**
     * Find bonuses by type
     */
    List<Bonus> findByBonusTypeOrderByBonusDateDesc(BonusType bonusType);

    /**
     * Find bonuses within a date range
     */
    @Query("SELECT b FROM Bonus b WHERE b.bonusDate BETWEEN :startDate AND :endDate " +
            "ORDER BY b.bonusDate DESC")
    List<Bonus> findByBonusDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Calculate total unpaid bonuses for an employee
     */
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Bonus b " +
            "WHERE b.employee.id = :employeeId AND b.isPaid = false")
    BigDecimal calculateTotalUnpaidByEmployee(@Param("employeeId") Long employeeId);

    /**
     * Calculate total bonuses for a payroll entry
     */
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Bonus b " +
            "WHERE b.payrollEntry.id = :payrollEntryId")
    BigDecimal calculateTotalByPayrollEntry(@Param("payrollEntryId") Long payrollEntryId);

    /**
     * Find bonuses approved by a manager
     */
    @Query("SELECT b FROM Bonus b WHERE b.approvedBy = :managerId " +
            "ORDER BY b.approvedAt DESC")
    List<Bonus> findByApprovedBy(@Param("managerId") Long managerId);
}
