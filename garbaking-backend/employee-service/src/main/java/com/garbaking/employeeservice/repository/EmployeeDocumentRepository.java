package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.DocumentType;
import com.garbaking.employeeservice.model.Employee;
import com.garbaking.employeeservice.model.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for EmployeeDocument entity
 */
@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {

    List<EmployeeDocument> findByEmployee(Employee employee);

    List<EmployeeDocument> findByEmployeeAndDocumentType(Employee employee, DocumentType documentType);

    List<EmployeeDocument> findByDocumentType(DocumentType documentType);

    @Query("SELECT d FROM EmployeeDocument d WHERE d.expiryDate IS NOT NULL AND d.expiryDate < :date")
    List<EmployeeDocument> findExpiredDocuments(@Param("date") LocalDate date);

    @Query("SELECT d FROM EmployeeDocument d WHERE d.expiryDate IS NOT NULL " +
           "AND d.expiryDate BETWEEN :startDate AND :endDate")
    List<EmployeeDocument> findDocumentsExpiringBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT d FROM EmployeeDocument d WHERE d.employee = :employee " +
           "ORDER BY d.createdAt DESC")
    List<EmployeeDocument> findByEmployeeOrderByCreatedAtDesc(@Param("employee") Employee employee);
}
