package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.Employee;
import com.garbaking.employeeservice.model.TimeOffRequest;
import com.garbaking.employeeservice.model.TimeOffRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for TimeOffRequest entity
 */
@Repository
public interface TimeOffRequestRepository extends JpaRepository<TimeOffRequest, Long> {

    List<TimeOffRequest> findByEmployee(Employee employee);

    List<TimeOffRequest> findByEmployeeAndStatus(Employee employee, TimeOffRequestStatus status);

    List<TimeOffRequest> findByStatus(TimeOffRequestStatus status);

    @Query("SELECT t FROM TimeOffRequest t WHERE t.employee = :employee " +
           "AND t.startDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.startDate DESC")
    List<TimeOffRequest> findByEmployeeBetweenDates(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT t FROM TimeOffRequest t WHERE " +
           "t.startDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.startDate DESC")
    List<TimeOffRequest> findAllBetweenDates(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT t FROM TimeOffRequest t WHERE t.employee = :employee " +
           "AND t.status = 'APPROVED' " +
           "AND :date BETWEEN t.startDate AND t.endDate")
    List<TimeOffRequest> findApprovedRequestsOnDate(
        @Param("employee") Employee employee,
        @Param("date") LocalDate date
    );

    @Query("SELECT t FROM TimeOffRequest t WHERE t.status = 'PENDING' " +
           "ORDER BY t.createdAt ASC")
    List<TimeOffRequest> findAllPendingRequests();

    @Query("SELECT COUNT(t) FROM TimeOffRequest t WHERE t.employee = :employee " +
           "AND t.status = 'APPROVED' " +
           "AND t.startDate BETWEEN :startDate AND :endDate")
    long countApprovedRequestsByEmployee(
        @Param("employee") Employee employee,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT t FROM TimeOffRequest t WHERE t.status = 'APPROVED' " +
           "AND :date BETWEEN t.startDate AND t.endDate")
    List<TimeOffRequest> findAllApprovedOnDate(@Param("date") LocalDate date);
}
