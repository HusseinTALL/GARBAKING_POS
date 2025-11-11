package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.AvailabilityWindow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for AvailabilityWindow entity operations
 */
@Repository
public interface AvailabilityWindowRepository extends JpaRepository<AvailabilityWindow, Long> {

    /**
     * Find all availability windows for an employee
     */
    @Query("SELECT aw FROM AvailabilityWindow aw WHERE aw.employee.id = :employeeId " +
            "AND aw.isActive = true ORDER BY aw.dayOfWeek, aw.startTime")
    List<AvailabilityWindow> findByEmployeeIdAndIsActiveTrue(@Param("employeeId") Long employeeId);

    /**
     * Find availability for an employee on a specific day of week
     */
    @Query("SELECT aw FROM AvailabilityWindow aw WHERE aw.employee.id = :employeeId " +
            "AND aw.dayOfWeek = :dayOfWeek AND aw.isActive = true")
    Optional<AvailabilityWindow> findByEmployeeIdAndDayOfWeek(
            @Param("employeeId") Long employeeId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek
    );

    /**
     * Find all employees available on a specific day of week
     */
    @Query("SELECT aw FROM AvailabilityWindow aw WHERE aw.dayOfWeek = :dayOfWeek " +
            "AND aw.isAvailable = true AND aw.isActive = true " +
            "ORDER BY aw.employee.lastName, aw.employee.firstName")
    List<AvailabilityWindow> findAvailableEmployeesByDay(@Param("dayOfWeek") DayOfWeek dayOfWeek);

    /**
     * Find employees available on a specific day and time range
     */
    @Query("SELECT aw FROM AvailabilityWindow aw WHERE aw.dayOfWeek = :dayOfWeek " +
            "AND aw.isAvailable = true AND aw.isActive = true " +
            "AND (aw.startTime IS NULL OR aw.startTime <= :time) " +
            "AND (aw.endTime IS NULL OR aw.endTime >= :time)")
    List<AvailabilityWindow> findAvailableEmployeesAtTime(
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("time") LocalTime time
    );

    /**
     * Find employees available for a specific time range on a day
     */
    @Query("SELECT aw FROM AvailabilityWindow aw WHERE aw.dayOfWeek = :dayOfWeek " +
            "AND aw.isAvailable = true AND aw.isActive = true " +
            "AND (aw.startTime IS NULL OR aw.startTime <= :startTime) " +
            "AND (aw.endTime IS NULL OR aw.endTime >= :endTime)")
    List<AvailabilityWindow> findAvailableEmployeesForShift(
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    /**
     * Check if an employee is available on a specific day
     */
    @Query("SELECT CASE WHEN COUNT(aw) > 0 THEN true ELSE false END " +
            "FROM AvailabilityWindow aw WHERE aw.employee.id = :employeeId " +
            "AND aw.dayOfWeek = :dayOfWeek AND aw.isAvailable = true AND aw.isActive = true")
    boolean isEmployeeAvailableOnDay(
            @Param("employeeId") Long employeeId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek
    );

    /**
     * Find all unavailable days for an employee
     */
    @Query("SELECT aw FROM AvailabilityWindow aw WHERE aw.employee.id = :employeeId " +
            "AND aw.isAvailable = false AND aw.isActive = true " +
            "ORDER BY aw.dayOfWeek")
    List<AvailabilityWindow> findUnavailableDaysByEmployee(@Param("employeeId") Long employeeId);

    /**
     * Delete all availability windows for an employee
     */
    void deleteByEmployeeId(Long employeeId);

    /**
     * Count total availability windows for an employee
     */
    Long countByEmployeeIdAndIsActiveTrue(Long employeeId);
}
