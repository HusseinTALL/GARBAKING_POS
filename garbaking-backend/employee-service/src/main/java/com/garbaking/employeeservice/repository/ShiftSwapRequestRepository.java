package com.garbaking.employeeservice.repository;

import com.garbaking.employeeservice.model.ShiftSwapRequest;
import com.garbaking.employeeservice.model.ShiftSwapStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ShiftSwapRequest entity operations
 */
@Repository
public interface ShiftSwapRequestRepository extends JpaRepository<ShiftSwapRequest, Long> {

    /**
     * Find all swap requests by requester
     */
    @Query("SELECT ssr FROM ShiftSwapRequest ssr WHERE ssr.requester.id = :employeeId " +
            "ORDER BY ssr.createdAt DESC")
    List<ShiftSwapRequest> findByRequesterId(@Param("employeeId") Long employeeId);

    /**
     * Find all swap requests targeting a specific employee
     */
    @Query("SELECT ssr FROM ShiftSwapRequest ssr WHERE ssr.targetEmployee.id = :employeeId " +
            "ORDER BY ssr.createdAt DESC")
    List<ShiftSwapRequest> findByTargetEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Find all swap requests involving an employee (as requester or target)
     */
    @Query("SELECT ssr FROM ShiftSwapRequest ssr WHERE ssr.requester.id = :employeeId " +
            "OR ssr.targetEmployee.id = :employeeId " +
            "ORDER BY ssr.createdAt DESC")
    List<ShiftSwapRequest> findByEmployeeInvolved(@Param("employeeId") Long employeeId);

    /**
     * Find all swap requests by status
     */
    List<ShiftSwapRequest> findByStatusOrderByCreatedAtDesc(ShiftSwapStatus status);

    /**
     * Find pending swap requests for a specific employee (as target)
     */
    @Query("SELECT ssr FROM ShiftSwapRequest ssr WHERE ssr.targetEmployee.id = :employeeId " +
            "AND ssr.status = 'PENDING' ORDER BY ssr.createdAt DESC")
    List<ShiftSwapRequest> findPendingRequestsForEmployee(@Param("employeeId") Long employeeId);

    /**
     * Find accepted swap requests awaiting manager approval
     */
    @Query("SELECT ssr FROM ShiftSwapRequest ssr WHERE ssr.status = 'ACCEPTED' " +
            "ORDER BY ssr.respondedAt DESC")
    List<ShiftSwapRequest> findAcceptedRequestsAwaitingApproval();

    /**
     * Find swap requests for a specific shift
     */
    @Query("SELECT ssr FROM ShiftSwapRequest ssr WHERE ssr.requesterShift.id = :shiftId " +
            "ORDER BY ssr.createdAt DESC")
    List<ShiftSwapRequest> findByRequesterShiftId(@Param("shiftId") Long shiftId);

    /**
     * Find swap requests involving a specific shift (as requester or target shift)
     */
    @Query("SELECT ssr FROM ShiftSwapRequest ssr WHERE ssr.requesterShift.id = :shiftId " +
            "OR ssr.targetShift.id = :shiftId " +
            "ORDER BY ssr.createdAt DESC")
    List<ShiftSwapRequest> findByShiftInvolved(@Param("shiftId") Long shiftId);

    /**
     * Find all swap requests by requester and status
     */
    @Query("SELECT ssr FROM ShiftSwapRequest ssr WHERE ssr.requester.id = :employeeId " +
            "AND ssr.status = :status ORDER BY ssr.createdAt DESC")
    List<ShiftSwapRequest> findByRequesterIdAndStatus(
            @Param("employeeId") Long employeeId,
            @Param("status") ShiftSwapStatus status
    );

    /**
     * Count pending requests for an employee (as target)
     */
    @Query("SELECT COUNT(ssr) FROM ShiftSwapRequest ssr WHERE ssr.targetEmployee.id = :employeeId " +
            "AND ssr.status = 'PENDING'")
    Long countPendingRequestsForEmployee(@Param("employeeId") Long employeeId);

    /**
     * Count accepted requests awaiting manager approval
     */
    Long countByStatus(ShiftSwapStatus status);

    /**
     * Find recent swap requests (all statuses, last 30 days)
     */
    @Query("SELECT ssr FROM ShiftSwapRequest ssr WHERE ssr.createdAt >= CURRENT_DATE - 30 " +
            "ORDER BY ssr.createdAt DESC")
    List<ShiftSwapRequest> findRecentSwapRequests();

    /**
     * Find swap requests approved by a specific manager
     */
    @Query("SELECT ssr FROM ShiftSwapRequest ssr WHERE ssr.approvedBy = :managerId " +
            "ORDER BY ssr.approvedAt DESC")
    List<ShiftSwapRequest> findByApprovedBy(@Param("managerId") Long managerId);
}
