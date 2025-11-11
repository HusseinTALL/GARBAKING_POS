package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.Employee;
import com.garbaking.employeeservice.model.TimeEntry;
import com.garbaking.employeeservice.model.TimeEntryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for TimeEntry entity
 */
@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {

    List<TimeEntry> findByEmployee(Employee employee);

    List<TimeEntry> findByEmployeeAndStatus(Employee employee, TimeEntryStatus status);

    Optional<TimeEntry> findByEmployeeAndStatus(Employee employee, TimeEntryStatus status, java.time.LocalDateTime clockInTime);

    @Query("SELECT t FROM TimeEntry t WHERE t.employee = :employee " +
           "AND t.status = 'ACTIVE' AND t.clockOutTime IS NULL")
    Optional<TimeEntry> findActiveTimeEntry(@Param("employee") Employee employee);

    @Query("SELECT t FROM TimeEntry t WHERE t.employee = :employee " +
           "AND t.clockInTime BETWEEN :startDate AND :endDate " +
           "ORDER BY t.clockInTime DESC")
    List<TimeEntry> findByEmployeeBetweenDates(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t FROM TimeEntry t WHERE t.clockInTime BETWEEN :startDate AND :endDate " +
           "ORDER BY t.clockInTime DESC")
    List<TimeEntry> findAllBetweenDates(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t FROM TimeEntry t WHERE t.status = :status " +
           "ORDER BY t.clockInTime DESC")
    List<TimeEntry> findByStatus(@Param("status") TimeEntryStatus status);

    @Query("SELECT t FROM TimeEntry t WHERE t.status = 'ACTIVE' " +
           "AND t.clockOutTime IS NULL ORDER BY t.clockInTime ASC")
    List<TimeEntry> findAllActiveClockedIn();

    @Query("SELECT COUNT(t) FROM TimeEntry t WHERE t.employee = :employee " +
           "AND t.clockInTime BETWEEN :startDate AND :endDate")
    long countByEmployeeBetweenDates(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
