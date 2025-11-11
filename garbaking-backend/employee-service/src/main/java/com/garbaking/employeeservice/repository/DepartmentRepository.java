package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Department entity
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByIsActiveTrue();

    Optional<Department> findByName(String name);

    boolean existsByName(String name);
}
