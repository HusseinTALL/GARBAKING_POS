package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.Attendance;
import com.garbaking.employeeservice.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Attendance entity
 */
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeAndAttendanceDate(Employee employee, LocalDate attendanceDate);

    List<Attendance> findByEmployee(Employee employee);

    @Query("SELECT a FROM Attendance a WHERE a.employee = :employee " +
           "AND a.attendanceDate BETWEEN :startDate AND :endDate " +
           "ORDER BY a.attendanceDate DESC")
    List<Attendance> findByEmployeeBetweenDates(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT a FROM Attendance a WHERE a.attendanceDate = :date")
    List<Attendance> findByDate(@Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.attendanceDate BETWEEN :startDate AND :endDate " +
           "ORDER BY a.attendanceDate DESC")
    List<Attendance> findAllBetweenDates(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT a FROM Attendance a WHERE a.employee = :employee " +
           "AND a.isPresent = true " +
           "AND a.attendanceDate BETWEEN :startDate AND :endDate")
    List<Attendance> findPresentDays(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT a FROM Attendance a WHERE a.employee = :employee " +
           "AND a.isAbsent = true " +
           "AND a.attendanceDate BETWEEN :startDate AND :endDate")
    List<Attendance> findAbsentDays(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee = :employee " +
           "AND a.isPresent = true " +
           "AND a.attendanceDate BETWEEN :startDate AND :endDate")
    long countPresentDays(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee = :employee " +
           "AND a.isAbsent = true " +
           "AND a.attendanceDate BETWEEN :startDate AND :endDate")
    long countAbsentDays(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
