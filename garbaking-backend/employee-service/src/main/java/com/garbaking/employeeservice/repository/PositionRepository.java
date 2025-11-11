package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.Department;
import com.garbaking.employeeservice.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Position entity
 */
@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

    List<Position> findByIsActiveTrue();

    List<Position> findByDepartment(Department department);

    List<Position> findByDepartmentAndIsActiveTrue(Department department, Boolean isActive);

    Optional<Position> findByTitle(String title);

    boolean existsByTitle(String title);
}
