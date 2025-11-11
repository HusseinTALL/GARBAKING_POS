package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.TrainingProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Training Program operations
 */
@Repository
public interface TrainingProgramRepository extends JpaRepository<TrainingProgram, Long> {

    /**
     * Find all active training programs
     */
    List<TrainingProgram> findByIsActiveTrueOrderByTitleAsc();

    /**
     * Find mandatory training programs
     */
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.isMandatory = true " +
            "AND tp.isActive = true ORDER BY tp.title ASC")
    List<TrainingProgram> findMandatoryPrograms();

    /**
     * Find training programs required for a position
     */
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.requiredForPosition.id = :positionId " +
            "AND tp.isActive = true ORDER BY tp.title ASC")
    List<TrainingProgram> findRequiredForPosition(@Param("positionId") Long positionId);

    /**
     * Search training programs by title
     */
    @Query("SELECT tp FROM TrainingProgram tp WHERE LOWER(tp.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
            "AND tp.isActive = true ORDER BY tp.title ASC")
    List<TrainingProgram> searchByTitle(@Param("title") String title);

    /**
     * Count active training programs
     */
    Long countByIsActiveTrue();

    /**
     * Count mandatory training programs
     */
    @Query("SELECT COUNT(tp) FROM TrainingProgram tp WHERE tp.isMandatory = true " +
            "AND tp.isActive = true")
    Long countMandatoryPrograms();
}
