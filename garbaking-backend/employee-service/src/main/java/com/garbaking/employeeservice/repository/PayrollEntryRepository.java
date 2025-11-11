package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.PayrollEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Payroll Entry operations
 */
@Repository
public interface PayrollEntryRepository extends JpaRepository<PayrollEntry, Long> {

    /**
     * Find all entries for a payroll period
     */
    @Query("SELECT pe FROM PayrollEntry pe WHERE pe.payrollPeriod.id = :periodId " +
            "ORDER BY pe.employee.lastName, pe.employee.firstName")
    List<PayrollEntry> findByPayrollPeriodId(@Param("periodId") Long periodId);

    /**
     * Find entry for specific employee in a payroll period
     */
    @Query("SELECT pe FROM PayrollEntry pe WHERE pe.payrollPeriod.id = :periodId " +
            "AND pe.employee.id = :employeeId")
    Optional<PayrollEntry> findByPayrollPeriodIdAndEmployeeId(
            @Param("periodId") Long periodId,
            @Param("employeeId") Long employeeId
    );

    /**
     * Find all payroll entries for an employee
     */
    @Query("SELECT pe FROM PayrollEntry pe WHERE pe.employee.id = :employeeId " +
            "ORDER BY pe.payrollPeriod.startDate DESC")
    List<PayrollEntry> findByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Calculate total gross pay for a payroll period
     */
    @Query("SELECT COALESCE(SUM(pe.grossPay), 0) FROM PayrollEntry pe " +
            "WHERE pe.payrollPeriod.id = :periodId")
    BigDecimal calculateTotalGrossPay(@Param("periodId") Long periodId);

    /**
     * Calculate total deductions for a payroll period
     */
    @Query("SELECT COALESCE(SUM(pe.totalDeductions), 0) FROM PayrollEntry pe " +
            "WHERE pe.payrollPeriod.id = :periodId")
    BigDecimal calculateTotalDeductions(@Param("periodId") Long periodId);

    /**
     * Calculate total net pay for a payroll period
     */
    @Query("SELECT COALESCE(SUM(pe.netPay), 0) FROM PayrollEntry pe " +
            "WHERE pe.payrollPeriod.id = :periodId")
    BigDecimal calculateTotalNetPay(@Param("periodId") Long periodId);

    /**
     * Calculate total hours for a payroll period
     */
    @Query("SELECT COALESCE(SUM(pe.totalHours), 0) FROM PayrollEntry pe " +
            "WHERE pe.payrollPeriod.id = :periodId")
    BigDecimal calculateTotalHours(@Param("periodId") Long periodId);

    /**
     * Calculate total overtime hours for a payroll period
     */
    @Query("SELECT COALESCE(SUM(pe.overtimeHours), 0) FROM PayrollEntry pe " +
            "WHERE pe.payrollPeriod.id = :periodId")
    BigDecimal calculateTotalOvertimeHours(@Param("periodId") Long periodId);

    /**
     * Count employees in a payroll period
     */
    @Query("SELECT COUNT(DISTINCT pe.employee.id) FROM PayrollEntry pe " +
            "WHERE pe.payrollPeriod.id = :periodId")
    Integer countEmployeesInPeriod(@Param("periodId") Long periodId);

    /**
     * Find entries with attendance issues
     */
    @Query("SELECT pe FROM PayrollEntry pe WHERE pe.payrollPeriod.id = :periodId " +
            "AND pe.attendanceIssues > 0 " +
            "ORDER BY pe.attendanceIssues DESC")
    List<PayrollEntry> findEntriesWithAttendanceIssues(@Param("periodId") Long periodId);
}
