package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.Department;
import com.garbaking.employeeservice.model.Employee;
import com.garbaking.employeeservice.model.EmployeeStatus;
import com.garbaking.employeeservice.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Employee entity
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmployeeNumber(String employeeNumber);

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByUserId(Long userId);

    List<Employee> findByStatus(EmployeeStatus status);

    List<Employee> findByPosition(Position position);

    List<Employee> findByDepartment(Department department);

    List<Employee> findByDepartmentAndStatus(Department department, EmployeeStatus status);

    List<Employee> findByPositionAndStatus(Position position, EmployeeStatus status);

    boolean existsByEmployeeNumber(String employeeNumber);

    boolean existsByEmail(String email);

    @Query("SELECT e FROM Employee e WHERE e.status = 'ACTIVE'")
    List<Employee> findAllActive();

    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Employee> searchEmployees(@Param("searchTerm") String searchTerm);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.status = 'ACTIVE'")
    long countActiveEmployees();

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.department = :department AND e.status = 'ACTIVE'")
    long countActiveEmployeesByDepartment(@Param("department") Department department);
}
