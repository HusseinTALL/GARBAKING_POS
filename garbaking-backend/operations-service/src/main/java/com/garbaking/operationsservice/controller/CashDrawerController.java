package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.cash.*;
import com.garbaking.operationsservice.model.*;
import com.garbaking.operationsservice.service.CashDrawerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cash-drawer")
@RequiredArgsConstructor
@Slf4j
public class CashDrawerController {

    private final CashDrawerService cashDrawerService;

    // ==================== Cash Drawer Management ====================

    @PostMapping("/register")
    public ResponseEntity<CashDrawer> registerDrawer(@Valid @RequestBody CashDrawerRegistrationRequest request) {
        log.info("Registering cash drawer: {} for terminal: {}", request.getName(), request.getTerminalId());
        
        CashDrawer drawer = cashDrawerService.registerDrawer(
                request.getName(),
                request.getTerminalId(),
                request.getLocation()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(drawer);
    }

    @GetMapping
    public ResponseEntity<List<CashDrawer>> listDrawers() {
        List<CashDrawer> drawers = cashDrawerService.listDrawers();
        return ResponseEntity.ok(drawers);
    }

    @GetMapping("/{drawerId}")
    public ResponseEntity<CashDrawer> getDrawer(@PathVariable Long drawerId) {
        CashDrawer drawer = cashDrawerService.getDrawer(drawerId);
        return ResponseEntity.ok(drawer);
    }

    @GetMapping("/terminal/{terminalId}")
    public ResponseEntity<CashDrawer> getDrawerByTerminalId(@PathVariable String terminalId) {
        CashDrawer drawer = cashDrawerService.getDrawerByTerminalId(terminalId);
        return ResponseEntity.ok(drawer);
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<CashDrawer>> listDrawersByLocation(@PathVariable String location) {
        List<CashDrawer> drawers = cashDrawerService.listDrawersByLocation(location);
        return ResponseEntity.ok(drawers);
    }

    // ==================== Session Management ====================

    @PostMapping("/{drawerId}/open")
    public ResponseEntity<CashDrawerSession> openSession(
            @PathVariable Long drawerId,
            @Valid @RequestBody OpenSessionRequest request) {
        
        log.info("Opening cash drawer session for drawer: {} by user: {}", drawerId, request.getUserId());
        
        CashDrawerSession session = cashDrawerService.openSession(
                drawerId,
                request.getUserId(),
                request.getStartingCash(),
                request.getDenominationCounts()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    @PostMapping("/sessions/{sessionId}/close")
    public ResponseEntity<CashDrawerSession> closeSession(
            @PathVariable Long sessionId,
            @Valid @RequestBody CloseSessionRequest request) {
        
        log.info("Closing cash drawer session: {} by user: {}", sessionId, request.getUserId());
        
        CashDrawerSession session = cashDrawerService.closeSession(
                sessionId,
                request.getUserId(),
                request.getCountedCash(),
                request.getDenominationCounts(),
                request.getNotes()
        );
        
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{drawerId}/current-session")
    public ResponseEntity<CashDrawerSession> getCurrentSession(@PathVariable Long drawerId) {
        CashDrawerSession session = cashDrawerService.getCurrentSession(drawerId);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{drawerId}/sessions")
    public ResponseEntity<List<CashDrawerSession>> getSessionsByDrawer(@PathVariable Long drawerId) {
        List<CashDrawerSession> sessions = cashDrawerService.getSessionsByDrawer(drawerId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/sessions/user/{userId}")
    public ResponseEntity<List<CashDrawerSession>> getSessionsByUser(@PathVariable Long userId) {
        List<CashDrawerSession> sessions = cashDrawerService.getSessionsByUser(userId);
        return ResponseEntity.ok(sessions);
    }

    // ==================== Cash Transactions ====================

    @PostMapping("/sessions/{sessionId}/drop")
    public ResponseEntity<CashTransaction> recordCashDrop(
            @PathVariable Long sessionId,
            @Valid @RequestBody CashDropRequest request) {
        
        log.info("Recording cash drop for session: {} amount: {}", sessionId, request.getAmount());
        
        CashTransaction transaction = cashDrawerService.recordCashDrop(
                sessionId,
                request.getAmount(),
                request.getNotes(),
                request.getUserId()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @PostMapping("/sessions/{sessionId}/payout")
    public ResponseEntity<CashTransaction> recordCashPayout(
            @PathVariable Long sessionId,
            @Valid @RequestBody CashPayoutRequest request) {
        
        log.info("Recording cash payout for session: {} amount: {}", sessionId, request.getAmount());
        
        CashTransaction transaction = cashDrawerService.recordCashPayout(
                sessionId,
                request.getAmount(),
                request.getNotes(),
                request.getUserId()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @PostMapping("/sessions/{sessionId}/no-sale")
    public ResponseEntity<Void> recordNoSale(
            @PathVariable Long sessionId,
            @RequestParam Long userId) {
        
        log.info("Recording no-sale for session: {}", sessionId);
        cashDrawerService.recordNoSale(sessionId, userId);
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sessions/{sessionId}/transactions")
    public ResponseEntity<List<CashTransaction>> getTransactionsBySession(@PathVariable Long sessionId) {
        List<CashTransaction> transactions = cashDrawerService.getTransactionsBySession(sessionId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/transactions/type/{type}")
    public ResponseEntity<List<CashTransaction>> getTransactionsByType(@PathVariable CashTransactionType type) {
        List<CashTransaction> transactions = cashDrawerService.getTransactionsByType(type);
        return ResponseEntity.ok(transactions);
    }

    // ==================== Reconciliation ====================

    @GetMapping("/sessions/{sessionId}/reconciliation")
    public ResponseEntity<CashReconciliation> getReconciliation(@PathVariable Long sessionId) {
        CashReconciliation reconciliation = cashDrawerService.getReconciliation(sessionId);
        return ResponseEntity.ok(reconciliation);
    }

    @GetMapping("/reconciliations/status/{status}")
    public ResponseEntity<List<CashReconciliation>> getReconciliationsByStatus(
            @PathVariable ReconciliationStatus status) {
        List<CashReconciliation> reconciliations = cashDrawerService.getReconciliationsByStatus(status);
        return ResponseEntity.ok(reconciliations);
    }

    @GetMapping("/reconciliations")
    public ResponseEntity<List<CashReconciliation>> getReconciliationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end) {
        List<CashReconciliation> reconciliations = cashDrawerService.getReconciliationsByDateRange(start, end);
        return ResponseEntity.ok(reconciliations);
    }

    // ==================== Statistics ====================

    @GetMapping("/sessions/{sessionId}/statistics")
    public ResponseEntity<Map<String, Object>> getSessionStatistics(@PathVariable Long sessionId) {
        Map<String, Object> statistics = cashDrawerService.getSessionStatistics(sessionId);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/sessions/{sessionId}/balance")
    public ResponseEntity<Map<String, Object>> getCurrentBalance(@PathVariable Long sessionId) {
        java.math.BigDecimal balance = cashDrawerService.getCurrentCashBalance(sessionId);
        return ResponseEntity.ok(Map.of("sessionId", sessionId, "currentBalance", balance));
    }

    @GetMapping("/sessions/{sessionId}/denominations")
    public ResponseEntity<List<DenominationCount>> getDenominationCounts(
            @PathVariable Long sessionId,
            @RequestParam CountType countType) {
        List<DenominationCount> counts = cashDrawerService.getDenominationCounts(sessionId, countType);
        return ResponseEntity.ok(counts);
    }
}
