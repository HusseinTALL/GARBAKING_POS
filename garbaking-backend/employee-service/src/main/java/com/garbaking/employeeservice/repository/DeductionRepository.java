package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.Deduction;
import com.garbaking.employeeservice.model.DeductionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository for Deduction operations
 */
@Repository
public interface DeductionRepository extends JpaRepository<Deduction, Long> {

    /**
     * Find all deductions for a payroll entry
     */
    @Query("SELECT d FROM Deduction d WHERE d.payrollEntry.id = :payrollEntryId " +
            "ORDER BY d.deductionType, d.description")
    List<Deduction> findByPayrollEntryId(@Param("payrollEntryId") Long payrollEntryId);

    /**
     * Find all deductions for an employee
     */
    @Query("SELECT d FROM Deduction d WHERE d.employee.id = :employeeId " +
            "ORDER BY d.createdAt DESC")
    List<Deduction> findByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Find recurring deductions for an employee
     */
    @Query("SELECT d FROM Deduction d WHERE d.employee.id = :employeeId " +
            "AND d.isRecurring = true ORDER BY d.deductionType, d.description")
    List<Deduction> findRecurringDeductionsByEmployee(@Param("employeeId") Long employeeId);

    /**
     * Find deductions by type
     */
    List<Deduction> findByDeductionTypeOrderByCreatedAtDesc(DeductionType deductionType);

    /**
     * Calculate total deductions for a payroll entry
     */
    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Deduction d " +
            "WHERE d.payrollEntry.id = :payrollEntryId")
    BigDecimal calculateTotalByPayrollEntry(@Param("payrollEntryId") Long payrollEntryId);

    /**
     * Calculate total recurring deductions for an employee
     */
    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Deduction d " +
            "WHERE d.employee.id = :employeeId AND d.isRecurring = true")
    BigDecimal calculateTotalRecurringByEmployee(@Param("employeeId") Long employeeId);
}
