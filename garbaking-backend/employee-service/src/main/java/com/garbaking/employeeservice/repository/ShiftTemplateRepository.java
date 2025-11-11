package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.ShiftTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

/**
 * Repository for ShiftTemplate entity operations
 */
@Repository
public interface ShiftTemplateRepository extends JpaRepository<ShiftTemplate, Long> {

    /**
     * Find all active templates
     */
    List<ShiftTemplate> findByIsActiveTrue();

    /**
     * Find all templates for a specific day of week
     */
    List<ShiftTemplate> findByDayOfWeekAndIsActiveTrue(DayOfWeek dayOfWeek);

    /**
     * Find all templates for a specific position
     */
    @Query("SELECT st FROM ShiftTemplate st WHERE st.position.id = :positionId " +
            "AND st.isActive = true ORDER BY st.dayOfWeek, st.startTime")
    List<ShiftTemplate> findByPositionIdAndIsActiveTrue(@Param("positionId") Long positionId);

    /**
     * Find all templates for a specific location
     */
    List<ShiftTemplate> findByLocationAndIsActiveTrue(String location);

    /**
     * Find templates by day of week and position
     */
    @Query("SELECT st FROM ShiftTemplate st WHERE st.dayOfWeek = :dayOfWeek " +
            "AND st.position.id = :positionId AND st.isActive = true " +
            "ORDER BY st.startTime")
    List<ShiftTemplate> findByDayOfWeekAndPositionId(
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("positionId") Long positionId
    );

    /**
     * Find templates by name (case-insensitive search)
     */
    @Query("SELECT st FROM ShiftTemplate st WHERE LOWER(st.templateName) LIKE LOWER(CONCAT('%', :name, '%')) " +
            "AND st.isActive = true")
    List<ShiftTemplate> searchByTemplateName(@Param("name") String name);

    /**
     * Count active templates
     */
    Long countByIsActiveTrue();

    /**
     * Count templates for a specific day of week
     */
    Long countByDayOfWeekAndIsActiveTrue(DayOfWeek dayOfWeek);
}
