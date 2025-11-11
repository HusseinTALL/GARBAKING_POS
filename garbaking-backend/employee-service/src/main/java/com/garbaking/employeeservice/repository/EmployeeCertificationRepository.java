package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.CertificationStatus;
import com.garbaking.employeeservice.model.EmployeeCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Employee Certification operations
 */
@Repository
public interface EmployeeCertificationRepository extends JpaRepository<EmployeeCertification, Long> {

    /**
     * Find all certifications for an employee
     */
    @Query("SELECT ec FROM EmployeeCertification ec WHERE ec.employee.id = :employeeId " +
            "ORDER BY ec.expirationDate ASC NULLS LAST")
    List<EmployeeCertification> findByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Find certification by employee and certification type
     */
    @Query("SELECT ec FROM EmployeeCertification ec WHERE ec.employee.id = :employeeId " +
            "AND ec.certificationType.id = :certificationTypeId")
    Optional<EmployeeCertification> findByEmployeeIdAndCertificationTypeId(
            @Param("employeeId") Long employeeId,
            @Param("certificationTypeId") Long certificationTypeId
    );

    /**
     * Find active certifications for an employee
     */
    @Query("SELECT ec FROM EmployeeCertification ec WHERE ec.employee.id = :employeeId " +
            "AND ec.status = 'ACTIVE' ORDER BY ec.expirationDate ASC NULLS LAST")
    List<EmployeeCertification> findActiveByEmployee(@Param("employeeId") Long employeeId);

    /**
     * Find certifications by status
     */
    List<EmployeeCertification> findByStatusOrderByExpirationDateAsc(CertificationStatus status);

    /**
     * Find expired certifications
     */
    @Query("SELECT ec FROM EmployeeCertification ec WHERE ec.expirationDate < :today " +
            "AND ec.status != 'EXPIRED' AND ec.status != 'REVOKED' " +
            "ORDER BY ec.expirationDate ASC")
    List<EmployeeCertification> findExpiredCertifications(@Param("today") LocalDate today);

    /**
     * Find certifications expiring soon (within 30 days)
     */
    @Query("SELECT ec FROM EmployeeCertification ec WHERE ec.expirationDate BETWEEN :today AND :thirtyDaysFromNow " +
            "AND ec.status = 'ACTIVE' " +
            "ORDER BY ec.expirationDate ASC")
    List<EmployeeCertification> findExpiringSoon(
            @Param("today") LocalDate today,
            @Param("thirtyDaysFromNow") LocalDate thirtyDaysFromNow
    );

    /**
     * Find certifications expiring soon for an employee
     */
    @Query("SELECT ec FROM EmployeeCertification ec WHERE ec.employee.id = :employeeId " +
            "AND ec.expirationDate BETWEEN :today AND :thirtyDaysFromNow " +
            "AND ec.status IN ('ACTIVE', 'EXPIRING_SOON') " +
            "ORDER BY ec.expirationDate ASC")
    List<EmployeeCertification> findExpiringSoonByEmployee(
            @Param("employeeId") Long employeeId,
            @Param("today") LocalDate today,
            @Param("thirtyDaysFromNow") LocalDate thirtyDaysFromNow
    );

    /**
     * Find employees with a specific certification type
     */
    @Query("SELECT ec FROM EmployeeCertification ec WHERE ec.certificationType.id = :certificationTypeId " +
            "AND ec.status = 'ACTIVE' " +
            "ORDER BY ec.employee.lastName, ec.employee.firstName")
    List<EmployeeCertification> findEmployeesByCertificationType(@Param("certificationTypeId") Long certificationTypeId);

    /**
     * Count certifications by status
     */
    Long countByStatus(CertificationStatus status);

    /**
     * Count active certifications for an employee
     */
    @Query("SELECT COUNT(ec) FROM EmployeeCertification ec WHERE ec.employee.id = :employeeId " +
            "AND ec.status = 'ACTIVE'")
    Long countActiveByEmployee(@Param("employeeId") Long employeeId);

    /**
     * Find pending certifications (awaiting verification)
     */
    @Query("SELECT ec FROM EmployeeCertification ec WHERE ec.status = 'PENDING' " +
            "ORDER BY ec.createdAt ASC")
    List<EmployeeCertification> findPendingCertifications();
}
