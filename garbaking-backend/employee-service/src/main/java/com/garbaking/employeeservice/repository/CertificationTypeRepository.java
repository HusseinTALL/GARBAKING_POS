package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.CertificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Certification Type operations
 */
@Repository
public interface CertificationTypeRepository extends JpaRepository<CertificationType, Long> {

    /**
     * Find all active certification types
     */
    List<CertificationType> findByIsActiveTrueOrderByNameAsc();

    /**
     * Find mandatory certification types
     */
    @Query("SELECT ct FROM CertificationType ct WHERE ct.isMandatory = true " +
            "AND ct.isActive = true ORDER BY ct.name ASC")
    List<CertificationType> findMandatoryCertifications();

    /**
     * Find certifications required for a position
     */
    @Query("SELECT ct FROM CertificationType ct WHERE ct.requiredForPosition.id = :positionId " +
            "AND ct.isActive = true ORDER BY ct.name ASC")
    List<CertificationType> findRequiredForPosition(@Param("positionId") Long positionId);

    /**
     * Search certification types by name
     */
    @Query("SELECT ct FROM CertificationType ct WHERE LOWER(ct.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
            "AND ct.isActive = true ORDER BY ct.name ASC")
    List<CertificationType> searchByName(@Param("name") String name);

    /**
     * Find certifications by issuing organization
     */
    @Query("SELECT ct FROM CertificationType ct WHERE LOWER(ct.issuingOrganization) LIKE LOWER(CONCAT('%', :org, '%')) " +
            "AND ct.isActive = true ORDER BY ct.name ASC")
    List<CertificationType> findByIssuingOrganization(@Param("org") String organization);

    /**
     * Count active certification types
     */
    Long countByIsActiveTrue();

    /**
     * Count mandatory certification types
     */
    @Query("SELECT COUNT(ct) FROM CertificationType ct WHERE ct.isMandatory = true " +
            "AND ct.isActive = true")
    Long countMandatoryCertifications();
}
