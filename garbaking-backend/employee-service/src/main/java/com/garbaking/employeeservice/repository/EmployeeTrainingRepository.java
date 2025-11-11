package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.EmployeeTraining;
import com.garbaking.employeeservice.model.TrainingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Employee Training operations
 */
@Repository
public interface EmployeeTrainingRepository extends JpaRepository<EmployeeTraining, Long> {

    /**
     * Find all training for an employee
     */
    @Query("SELECT et FROM EmployeeTraining et WHERE et.employee.id = :employeeId " +
            "ORDER BY et.assignedDate DESC")
    List<EmployeeTraining> findByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Find training by employee and program
     */
    @Query("SELECT et FROM EmployeeTraining et WHERE et.employee.id = :employeeId " +
            "AND et.trainingProgram.id = :programId")
    Optional<EmployeeTraining> findByEmployeeIdAndProgramId(
            @Param("employeeId") Long employeeId,
            @Param("programId") Long programId
    );

    /**
     * Find training by status
     */
    List<EmployeeTraining> findByStatusOrderByDueDateAsc(TrainingStatus status);

    /**
     * Find active training for an employee (not completed or failed)
     */
    @Query("SELECT et FROM EmployeeTraining et WHERE et.employee.id = :employeeId " +
            "AND et.status IN ('NOT_STARTED', 'IN_PROGRESS') " +
            "ORDER BY et.dueDate ASC")
    List<EmployeeTraining> findActiveTrainingByEmployee(@Param("employeeId") Long employeeId);

    /**
     * Find overdue training
     */
    @Query("SELECT et FROM EmployeeTraining et WHERE et.dueDate < :today " +
            "AND et.status IN ('NOT_STARTED', 'IN_PROGRESS') " +
            "ORDER BY et.dueDate ASC")
    List<EmployeeTraining> findOverdueTraining(@Param("today") LocalDate today);

    /**
     * Find completed training for an employee
     */
    @Query("SELECT et FROM EmployeeTraining et WHERE et.employee.id = :employeeId " +
            "AND et.status = 'COMPLETED' ORDER BY et.completionDate DESC")
    List<EmployeeTraining> findCompletedTrainingByEmployee(@Param("employeeId") Long employeeId);

    /**
     * Find employees who completed a specific training program
     */
    @Query("SELECT et FROM EmployeeTraining et WHERE et.trainingProgram.id = :programId " +
            "AND et.status = 'COMPLETED' " +
            "ORDER BY et.completionDate DESC")
    List<EmployeeTraining> findCompletionsByProgram(@Param("programId") Long programId);

    /**
     * Count training by status
     */
    Long countByStatus(TrainingStatus status);

    /**
     * Get completion rate for an employee
     */
    @Query("SELECT (COUNT(CASE WHEN et.status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(*)) " +
            "FROM EmployeeTraining et WHERE et.employee.id = :employeeId")
    Double getCompletionRateByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Find training due soon (within next 7 days)
     */
    @Query("SELECT et FROM EmployeeTraining et WHERE et.dueDate BETWEEN :today AND :weekFromNow " +
            "AND et.status IN ('NOT_STARTED', 'IN_PROGRESS') " +
            "ORDER BY et.dueDate ASC")
    List<EmployeeTraining> findTrainingDueSoon(
            @Param("today") LocalDate today,
            @Param("weekFromNow") LocalDate weekFromNow
    );
}
