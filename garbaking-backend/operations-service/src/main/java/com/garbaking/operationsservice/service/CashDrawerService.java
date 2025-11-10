package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.model.*;
import com.garbaking.operationsservice.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CashDrawerService {

    private final CashDrawerRepository drawerRepository;
    private final CashDrawerSessionRepository sessionRepository;
    private final CashTransactionRepository transactionRepository;
    private final DenominationCountRepository denominationRepository;
    private final CashReconciliationRepository reconciliationRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    // ==================== Cash Drawer Management ====================

    @Transactional
    public CashDrawer registerDrawer(String name, String terminalId, String location) {
        // Check if terminal already has a drawer
        drawerRepository.findByTerminalId(terminalId).ifPresent(existing -> {
            throw new IllegalStateException("Cash drawer already registered for terminal: " + terminalId);
        });

        CashDrawer drawer = CashDrawer.builder()
                .name(name)
                .terminalId(terminalId)
                .location(location)
                .status(CashDrawerStatus.CLOSED)
                .build();

        drawer = drawerRepository.save(drawer);
        log.info("Cash drawer registered: {} at terminal: {}", name, terminalId);

        return drawer;
    }

    public CashDrawer getDrawer(Long drawerId) {
        return drawerRepository.findById(drawerId)
                .orElseThrow(() -> new IllegalArgumentException("Cash drawer not found: " + drawerId));
    }

    public CashDrawer getDrawerByTerminalId(String terminalId) {
        return drawerRepository.findByTerminalId(terminalId)
                .orElseThrow(() -> new IllegalArgumentException("Cash drawer not found for terminal: " + terminalId));
    }

    public List<CashDrawer> listDrawers() {
        return drawerRepository.findAll();
    }

    public List<CashDrawer> listDrawersByLocation(String location) {
        return drawerRepository.findByLocation(location);
    }

    // ==================== Session Management ====================

    @Transactional
    public CashDrawerSession openSession(Long drawerId, Long userId, BigDecimal startingCash, 
                                         Map<String, Integer> denominationCounts) {
        CashDrawer drawer = getDrawer(drawerId);

        // Check if drawer already has an open session
        sessionRepository.findOpenSessionByDrawerId(drawerId).ifPresent(session -> {
            throw new IllegalStateException("Cash drawer already has an open session: " + session.getId());
        });

        // Create new session
        CashDrawerSession session = CashDrawerSession.builder()
                .cashDrawerId(drawerId)
                .userId(userId)
                .startingCash(startingCash)
                .status(SessionStatus.OPEN)
                .openedAt(Instant.now())
                .build();

        session = sessionRepository.save(session);

        // Update drawer status
        drawer.setStatus(CashDrawerStatus.OPEN);
        drawerRepository.save(drawer);

        // Record starting float transaction
        recordCashTransaction(session.getId(), CashTransactionType.STARTING_FLOAT, 
                startingCash, "FLOAT-" + session.getId(), "Opening float", userId);

        // Record denomination counts if provided
        if (denominationCounts != null && !denominationCounts.isEmpty()) {
            recordDenominationCounts(session.getId(), CountType.OPENING, denominationCounts);
        }

        log.info("Cash drawer session opened: {} by user: {} with starting cash: {}", 
                session.getId(), userId, startingCash);

        return session;
    }

    @Transactional
    public CashDrawerSession closeSession(Long sessionId, Long userId, BigDecimal countedCash, 
                                          Map<String, Integer> denominationCounts, String notes) {
        CashDrawerSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (session.getStatus() != SessionStatus.OPEN) {
            throw new IllegalStateException("Session is not open: " + sessionId);
        }

        // Calculate expected cash
        BigDecimal expectedCash = calculateExpectedCash(sessionId);

        // Calculate variance
        BigDecimal variance = countedCash.subtract(expectedCash);

        // Update session
        session.setEndingCash(countedCash);
        session.setExpectedCash(expectedCash);
        session.setVariance(variance);
        session.setStatus(SessionStatus.CLOSED);
        session.setClosedAt(Instant.now());
        session.setNotes(notes);

        session = sessionRepository.save(session);

        // Update drawer status
        CashDrawer drawer = getDrawer(session.getCashDrawerId());
        drawer.setStatus(CashDrawerStatus.CLOSED);
        drawerRepository.save(drawer);

        // Record denomination counts if provided
        if (denominationCounts != null && !denominationCounts.isEmpty()) {
            recordDenominationCounts(sessionId, CountType.CLOSING, denominationCounts);
        }

        // Create reconciliation record
        ReconciliationStatus reconciliationStatus;
        if (variance.compareTo(BigDecimal.ZERO) == 0) {
            reconciliationStatus = ReconciliationStatus.BALANCED;
        } else if (variance.compareTo(BigDecimal.ZERO) < 0) {
            reconciliationStatus = ReconciliationStatus.SHORT;
        } else {
            reconciliationStatus = ReconciliationStatus.OVER;
        }

        CashReconciliation reconciliation = CashReconciliation.builder()
                .sessionId(sessionId)
                .expectedCash(expectedCash)
                .countedCash(countedCash)
                .variance(variance)
                .status(reconciliationStatus)
                .reconciledBy(userId)
                .build();

        reconciliationRepository.save(reconciliation);

        log.info("Cash drawer session closed: {} Expected: {} Counted: {} Variance: {} Status: {}", 
                sessionId, expectedCash, countedCash, variance, reconciliationStatus);

        return session;
    }

    public CashDrawerSession getCurrentSession(Long drawerId) {
        return sessionRepository.findOpenSessionByDrawerId(drawerId)
                .orElseThrow(() -> new IllegalStateException("No open session for drawer: " + drawerId));
    }

    public List<CashDrawerSession> getSessionsByDrawer(Long drawerId) {
        return sessionRepository.findByCashDrawerId(drawerId);
    }

    public List<CashDrawerSession> getSessionsByUser(Long userId) {
        return sessionRepository.findByUserId(userId);
    }

    // ==================== Cash Transactions ====================

    @Transactional
    public CashTransaction recordCashSale(Long sessionId, BigDecimal amount, String referenceNumber, Long userId) {
        return recordCashTransaction(sessionId, CashTransactionType.SALE, amount, 
                referenceNumber, "Cash sale", userId);
    }

    @Transactional
    public CashTransaction recordCashRefund(Long sessionId, BigDecimal amount, String referenceNumber, Long userId) {
        return recordCashTransaction(sessionId, CashTransactionType.REFUND, amount.negate(), 
                referenceNumber, "Cash refund", userId);
    }

    @Transactional
    public CashTransaction recordCashDrop(Long sessionId, BigDecimal amount, String notes, Long userId) {
        // Verify session is open
        CashDrawerSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (session.getStatus() != SessionStatus.OPEN) {
            throw new IllegalStateException("Session is not open: " + sessionId);
        }

        return recordCashTransaction(sessionId, CashTransactionType.DROP, amount.negate(), 
                "DROP-" + Instant.now().toEpochMilli(), notes, userId);
    }

    @Transactional
    public CashTransaction recordCashPayout(Long sessionId, BigDecimal amount, String notes, Long userId) {
        // Verify session is open
        CashDrawerSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (session.getStatus() != SessionStatus.OPEN) {
            throw new IllegalStateException("Session is not open: " + sessionId);
        }

        return recordCashTransaction(sessionId, CashTransactionType.PAYOUT, amount.negate(), 
                "PAYOUT-" + Instant.now().toEpochMilli(), notes, userId);
    }

    @Transactional
    public void recordNoSale(Long sessionId, Long userId) {
        recordCashTransaction(sessionId, CashTransactionType.NO_SALE, BigDecimal.ZERO, 
                "NOSALE-" + Instant.now().toEpochMilli(), "No sale - drawer opened for change", userId);
    }

    private CashTransaction recordCashTransaction(Long sessionId, CashTransactionType type, 
                                                  BigDecimal amount, String referenceNumber, 
                                                  String notes, Long userId) {
        CashTransaction transaction = CashTransaction.builder()
                .sessionId(sessionId)
                .type(type)
                .amount(amount)
                .referenceNumber(referenceNumber)
                .notes(notes)
                .createdBy(userId)
                .build();

        transaction = transactionRepository.save(transaction);
        log.debug("Cash transaction recorded: {} type: {} amount: {}", 
                transaction.getId(), type, amount);

        return transaction;
    }

    public List<CashTransaction> getTransactionsBySession(Long sessionId) {
        return transactionRepository.findBySessionId(sessionId);
    }

    public List<CashTransaction> getTransactionsByType(CashTransactionType type) {
        return transactionRepository.findByType(type);
    }

    // ==================== Denomination Tracking ====================

    @Transactional
    public void recordDenominationCounts(Long sessionId, CountType countType, Map<String, Integer> counts) {
        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            String denomination = entry.getKey();
            Integer count = entry.getValue();
            BigDecimal denomValue = new BigDecimal(denomination);
            BigDecimal total = denomValue.multiply(new BigDecimal(count));

            DenominationCount denominationCount = DenominationCount.builder()
                    .sessionId(sessionId)
                    .countType(countType)
                    .denomination(denomination)
                    .count(count)
                    .total(total)
                    .build();

            denominationRepository.save(denominationCount);
        }

        log.debug("Denomination counts recorded for session: {} type: {}", sessionId, countType);
    }

    public List<DenominationCount> getDenominationCounts(Long sessionId, CountType countType) {
        return denominationRepository.findBySessionIdAndCountType(sessionId, countType);
    }

    // ==================== Reconciliation ====================

    public CashReconciliation getReconciliation(Long sessionId) {
        return reconciliationRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Reconciliation not found for session: " + sessionId));
    }

    public List<CashReconciliation> getReconciliationsByStatus(ReconciliationStatus status) {
        return reconciliationRepository.findByStatus(status);
    }

    public List<CashReconciliation> getReconciliationsByDateRange(Instant start, Instant end) {
        return reconciliationRepository.findByReconciledAtBetween(start, end);
    }

    // ==================== Calculations ====================

    private BigDecimal calculateExpectedCash(Long sessionId) {
        CashDrawerSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        // Start with starting cash
        BigDecimal expected = session.getStartingCash();

        // Add all cash transactions
        BigDecimal transactionTotal = transactionRepository.sumAmountBySessionId(sessionId);
        if (transactionTotal != null) {
            expected = expected.add(transactionTotal);
        }

        return expected;
    }

    public BigDecimal getCurrentCashBalance(Long sessionId) {
        return calculateExpectedCash(sessionId);
    }

    // ==================== Statistics ====================

    public Map<String, Object> getSessionStatistics(Long sessionId) {
        CashDrawerSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        List<CashTransaction> transactions = transactionRepository.findBySessionId(sessionId);

        long saleCount = transactions.stream()
                .filter(t -> t.getType() == CashTransactionType.SALE)
                .count();

        long refundCount = transactions.stream()
                .filter(t -> t.getType() == CashTransactionType.REFUND)
                .count();

        long dropCount = transactions.stream()
                .filter(t -> t.getType() == CashTransactionType.DROP)
                .count();

        long payoutCount = transactions.stream()
                .filter(t -> t.getType() == CashTransactionType.PAYOUT)
                .count();

        BigDecimal currentBalance = getCurrentCashBalance(sessionId);

        return Map.of(
                "sessionId", sessionId,
                "startingCash", session.getStartingCash(),
                "currentBalance", currentBalance,
                "saleCount", saleCount,
                "refundCount", refundCount,
                "dropCount", dropCount,
                "payoutCount", payoutCount,
                "transactionCount", transactions.size()
        );
    }
}
