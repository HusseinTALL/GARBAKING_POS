package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.Shift;
import com.garbaking.employeeservice.model.ShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Shift entity operations
 */
@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

    /**
     * Find all shifts for an employee on a specific date
     */
    List<Shift> findByEmployeeIdAndShiftDate(Long employeeId, LocalDate shiftDate);

    /**
     * Find all shifts for an employee within a date range
     */
    @Query("SELECT s FROM Shift s WHERE s.employee.id = :employeeId " +
            "AND s.shiftDate BETWEEN :startDate AND :endDate " +
            "ORDER BY s.shiftDate, s.startTime")
    List<Shift> findByEmployeeIdAndDateRange(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find all shifts within a date range
     */
    @Query("SELECT s FROM Shift s WHERE s.shiftDate BETWEEN :startDate AND :endDate " +
            "ORDER BY s.shiftDate, s.startTime")
    List<Shift> findByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find all shifts by status
     */
    List<Shift> findByStatus(ShiftStatus status);

    /**
     * Find all shifts by status within a date range
     */
    @Query("SELECT s FROM Shift s WHERE s.status = :status " +
            "AND s.shiftDate BETWEEN :startDate AND :endDate " +
            "ORDER BY s.shiftDate, s.startTime")
    List<Shift> findByStatusAndDateRange(
            @Param("status") ShiftStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find conflicting shifts for an employee on a specific date and time range
     */
    @Query("SELECT s FROM Shift s WHERE s.employee.id = :employeeId " +
            "AND s.shiftDate = :shiftDate " +
            "AND s.status IN ('SCHEDULED', 'IN_PROGRESS') " +
            "AND NOT (s.endTime <= :startTime OR s.startTime >= :endTime)")
    List<Shift> findConflictingShifts(
            @Param("employeeId") Long employeeId,
            @Param("shiftDate") LocalDate shiftDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    /**
     * Find all shifts for a position within a date range
     */
    @Query("SELECT s FROM Shift s WHERE s.position.id = :positionId " +
            "AND s.shiftDate BETWEEN :startDate AND :endDate " +
            "ORDER BY s.shiftDate, s.startTime")
    List<Shift> findByPositionIdAndDateRange(
            @Param("positionId") Long positionId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find all shifts by location within a date range
     */
    @Query("SELECT s FROM Shift s WHERE s.location = :location " +
            "AND s.shiftDate BETWEEN :startDate AND :endDate " +
            "ORDER BY s.shiftDate, s.startTime")
    List<Shift> findByLocationAndDateRange(
            @Param("location") String location,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find upcoming shifts for an employee (today and future)
     */
    @Query("SELECT s FROM Shift s WHERE s.employee.id = :employeeId " +
            "AND s.shiftDate >= :today " +
            "AND s.status IN ('SCHEDULED', 'IN_PROGRESS') " +
            "ORDER BY s.shiftDate, s.startTime")
    List<Shift> findUpcomingShiftsByEmployee(
            @Param("employeeId") Long employeeId,
            @Param("today") LocalDate today
    );

    /**
     * Find shifts scheduled for today
     */
    @Query("SELECT s FROM Shift s WHERE s.shiftDate = :today " +
            "AND s.status IN ('SCHEDULED', 'IN_PROGRESS') " +
            "ORDER BY s.startTime")
    List<Shift> findTodaysShifts(@Param("today") LocalDate today);

    /**
     * Count shifts for an employee within a date range
     */
    @Query("SELECT COUNT(s) FROM Shift s WHERE s.employee.id = :employeeId " +
            "AND s.shiftDate BETWEEN :startDate AND :endDate")
    Long countByEmployeeIdAndDateRange(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Calculate total scheduled hours for an employee within a date range
     */
    @Query("SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, s.startTime, s.endTime) - " +
            "COALESCE(s.breakMinutes, 0)) / 60.0, 0) " +
            "FROM Shift s WHERE s.employee.id = :employeeId " +
            "AND s.shiftDate BETWEEN :startDate AND :endDate " +
            "AND s.status != 'CANCELLED'")
    Double calculateTotalScheduledHours(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find unassigned shifts (shifts without an employee)
     */
    @Query("SELECT s FROM Shift s WHERE s.employee IS NULL " +
            "AND s.shiftDate >= :startDate " +
            "AND s.status = 'SCHEDULED' " +
            "ORDER BY s.shiftDate, s.startTime")
    List<Shift> findUnassignedShifts(@Param("startDate") LocalDate startDate);
}
