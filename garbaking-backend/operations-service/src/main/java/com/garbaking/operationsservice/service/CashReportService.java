package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.report.*;
import com.garbaking.operationsservice.model.*;
import com.garbaking.operationsservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for generating cash management reports
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CashReportService {

    private final CashDrawerSessionRepository sessionRepository;
    private final CashTransactionRepository transactionRepository;
    private final CashReconciliationRepository reconciliationRepository;
    private final CashDrawerService cashDrawerService;

    /**
     * Generate daily cash report for a specific date
     */
    @Transactional(readOnly = true)
    public DailyCashReportDTO generateDailyReport(LocalDate date) {
        log.info("Generating daily cash report for {}", date);

        Instant startOfDay = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = date.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant();

        // Get all sessions that were opened on this date
        List<CashDrawerSession> sessions = sessionRepository.findByOpenedAtBetween(startOfDay, endOfDay);

        if (sessions.isEmpty()) {
            return buildEmptyDailyReport(date);
        }

        // Calculate aggregated statistics
        int totalSessions = sessions.size();
        int openSessions = (int) sessions.stream()
                .filter(s -> s.getStatus() == SessionStatus.OPEN)
                .count();
        int closedSessions = totalSessions - openSessions;

        BigDecimal totalStartingCash = sessions.stream()
                .map(CashDrawerSession::getStartingCash)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Get all transactions for these sessions
        List<Long> sessionIds = sessions.stream()
                .map(CashDrawerSession::getId)
                .collect(Collectors.toList());

        List<CashTransaction> transactions = transactionRepository.findBySessionIdIn(sessionIds);

        // Calculate transaction totals
        BigDecimal totalSales = calculateTransactionTotal(transactions, CashTransactionType.SALE);
        BigDecimal totalRefunds = calculateTransactionTotal(transactions, CashTransactionType.REFUND).abs();
        BigDecimal totalDrops = calculateTransactionTotal(transactions, CashTransactionType.DROP).abs();
        BigDecimal totalPayouts = calculateTransactionTotal(transactions, CashTransactionType.PAYOUT).abs();

        int saleCount = countTransactions(transactions, CashTransactionType.SALE);
        int refundCount = countTransactions(transactions, CashTransactionType.REFUND);
        int dropCount = countTransactions(transactions, CashTransactionType.DROP);
        int payoutCount = countTransactions(transactions, CashTransactionType.PAYOUT);
        int noSaleCount = countTransactions(transactions, CashTransactionType.NO_SALE);

        BigDecimal netCashFlow = totalSales.subtract(totalRefunds).subtract(totalDrops).subtract(totalPayouts);

        // Calculate ending cash and variance statistics
        BigDecimal totalEndingCash = BigDecimal.ZERO;
        BigDecimal totalVariance = BigDecimal.ZERO;
        int balancedSessions = 0;
        int shortSessions = 0;
        int overSessions = 0;
        BigDecimal totalShortage = BigDecimal.ZERO;
        BigDecimal totalOverage = BigDecimal.ZERO;

        List<SessionSummaryDTO> sessionSummaries = new ArrayList<>();

        for (CashDrawerSession session : sessions) {
            SessionSummaryDTO summary = buildSessionSummary(session);
            sessionSummaries.add(summary);

            if (session.getStatus() == SessionStatus.CLOSED) {
                if (session.getEndingCash() != null) {
                    totalEndingCash = totalEndingCash.add(session.getEndingCash());
                }
                if (session.getVariance() != null) {
                    totalVariance = totalVariance.add(session.getVariance());

                    if (session.getVariance().compareTo(BigDecimal.ZERO) == 0) {
                        balancedSessions++;
                    } else if (session.getVariance().compareTo(BigDecimal.ZERO) < 0) {
                        shortSessions++;
                        totalShortage = totalShortage.add(session.getVariance().abs());
                    } else {
                        overSessions++;
                        totalOverage = totalOverage.add(session.getVariance());
                    }
                }
            }
        }

        return DailyCashReportDTO.builder()
                .reportDate(date)
                .totalSessions(totalSessions)
                .openSessions(openSessions)
                .closedSessions(closedSessions)
                .totalStartingCash(totalStartingCash)
                .totalEndingCash(totalEndingCash)
                .totalSales(totalSales)
                .totalRefunds(totalRefunds)
                .totalDrops(totalDrops)
                .totalPayouts(totalPayouts)
                .netCashFlow(netCashFlow)
                .totalTransactionCount(transactions.size())
                .saleCount(saleCount)
                .refundCount(refundCount)
                .dropCount(dropCount)
                .payoutCount(payoutCount)
                .noSaleCount(noSaleCount)
                .totalVariance(totalVariance)
                .balancedSessions(balancedSessions)
                .shortSessions(shortSessions)
                .overSessions(overSessions)
                .totalShortage(totalShortage)
                .totalOverage(totalOverage)
                .sessions(sessionSummaries)
                .build();
    }

    /**
     * Get detailed session summary
     */
    @Transactional(readOnly = true)
    public SessionSummaryDTO getSessionSummary(Long sessionId) {
        log.info("Generating session summary for session {}", sessionId);

        CashDrawerSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        return buildSessionSummary(session);
    }

    /**
     * Generate variance report for date range
     */
    @Transactional(readOnly = true)
    public List<VarianceReportDTO> getVarianceReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating variance report from {} to {}", startDate, endDate);

        Instant start = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant end = endDate.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant();

        List<CashReconciliation> reconciliations = reconciliationRepository.findByReconciledAtBetween(start, end);

        return reconciliations.stream()
                .filter(r -> r.getStatus() != ReconciliationStatus.BALANCED)
                .map(this::buildVarianceReport)
                .collect(Collectors.toList());
    }

    /**
     * Generate cash flow analysis for date range
     */
    @Transactional(readOnly = true)
    public CashFlowReportDTO getCashFlowAnalysis(LocalDate startDate, LocalDate endDate) {
        log.info("Generating cash flow analysis from {} to {}", startDate, endDate);

        List<DailyCashFlowDTO> dailyBreakdown = new ArrayList<>();
        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal totalDrops = BigDecimal.ZERO;
        BigDecimal peakSales = BigDecimal.ZERO;
        LocalDate peakSalesDate = null;

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            DailyCashFlowDTO dailyFlow = generateDailyCashFlow(currentDate);
            dailyBreakdown.add(dailyFlow);

            totalSales = totalSales.add(dailyFlow.getSales());
            totalDrops = totalDrops.add(dailyFlow.getDrops());

            if (dailyFlow.getSales().compareTo(peakSales) > 0) {
                peakSales = dailyFlow.getSales();
                peakSalesDate = currentDate;
            }

            currentDate = currentDate.plusDays(1);
        }

        int totalDays = dailyBreakdown.size();
        BigDecimal openingBalance = dailyBreakdown.isEmpty() ? BigDecimal.ZERO : dailyBreakdown.get(0).getOpeningBalance();
        BigDecimal closingBalance = dailyBreakdown.isEmpty() ? BigDecimal.ZERO : dailyBreakdown.get(dailyBreakdown.size() - 1).getClosingBalance();

        BigDecimal totalInflows = dailyBreakdown.stream()
                .map(DailyCashFlowDTO::getSales)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOutflows = dailyBreakdown.stream()
                .map(d -> d.getRefunds().add(d.getDrops()).add(d.getPayouts()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageDailySales = totalDays > 0 ? totalSales.divide(BigDecimal.valueOf(totalDays), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal averageDailyDrops = totalDays > 0 ? totalDrops.divide(BigDecimal.valueOf(totalDays), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        return CashFlowReportDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalDays(totalDays)
                .openingBalance(openingBalance)
                .closingBalance(closingBalance)
                .netChange(closingBalance.subtract(openingBalance))
                .totalInflows(totalInflows)
                .salesInflow(totalInflows)
                .otherInflows(BigDecimal.ZERO)
                .totalOutflows(totalOutflows)
                .refundsOutflow(dailyBreakdown.stream().map(DailyCashFlowDTO::getRefunds).reduce(BigDecimal.ZERO, BigDecimal::add))
                .dropsOutflow(dailyBreakdown.stream().map(DailyCashFlowDTO::getDrops).reduce(BigDecimal.ZERO, BigDecimal::add))
                .payoutsOutflow(dailyBreakdown.stream().map(DailyCashFlowDTO::getPayouts).reduce(BigDecimal.ZERO, BigDecimal::add))
                .dailyBreakdown(dailyBreakdown)
                .averageDailySales(averageDailySales)
                .averageDailyDrops(averageDailyDrops)
                .peakSalesDay(peakSales)
                .peakSalesDate(peakSalesDate)
                .build();
    }

    // Helper methods

    private DailyCashReportDTO buildEmptyDailyReport(LocalDate date) {
        return DailyCashReportDTO.builder()
                .reportDate(date)
                .totalSessions(0)
                .openSessions(0)
                .closedSessions(0)
                .totalStartingCash(BigDecimal.ZERO)
                .totalEndingCash(BigDecimal.ZERO)
                .totalSales(BigDecimal.ZERO)
                .totalRefunds(BigDecimal.ZERO)
                .totalDrops(BigDecimal.ZERO)
                .totalPayouts(BigDecimal.ZERO)
                .netCashFlow(BigDecimal.ZERO)
                .totalTransactionCount(0)
                .saleCount(0)
                .refundCount(0)
                .dropCount(0)
                .payoutCount(0)
                .noSaleCount(0)
                .totalVariance(BigDecimal.ZERO)
                .balancedSessions(0)
                .shortSessions(0)
                .overSessions(0)
                .totalShortage(BigDecimal.ZERO)
                .totalOverage(BigDecimal.ZERO)
                .sessions(new ArrayList<>())
                .build();
    }

    private SessionSummaryDTO buildSessionSummary(CashDrawerSession session) {
        List<CashTransaction> transactions = transactionRepository.findBySessionIdOrderByCreatedAtDesc(session.getId());

        BigDecimal expectedCash = session.getExpectedCash() != null ? session.getExpectedCash() :
                (session.getStatus() == SessionStatus.OPEN ? cashDrawerService.getCurrentCashBalance(session.getId()) : BigDecimal.ZERO);

        String varianceStatus = null;
        if (session.getStatus() == SessionStatus.CLOSED && session.getVariance() != null) {
            if (session.getVariance().compareTo(BigDecimal.ZERO) == 0) {
                varianceStatus = "BALANCED";
            } else if (session.getVariance().compareTo(BigDecimal.ZERO) < 0) {
                varianceStatus = "SHORT";
            } else {
                varianceStatus = "OVER";
            }
        }

        Long durationMinutes = null;
        if (session.getClosedAt() != null) {
            durationMinutes = Duration.between(session.getOpenedAt(), session.getClosedAt()).toMinutes();
        }

        return SessionSummaryDTO.builder()
                .sessionId(session.getId())
                .drawerId(session.getCashDrawerId())
                .drawerName("Drawer " + session.getCashDrawerId())
                .userId(session.getUserId())
                .userName("User " + session.getUserId())
                .status(session.getStatus())
                .openedAt(LocalDateTime.ofInstant(session.getOpenedAt(), ZoneId.systemDefault()))
                .closedAt(session.getClosedAt() != null ? LocalDateTime.ofInstant(session.getClosedAt(), ZoneId.systemDefault()) : null)
                .durationMinutes(durationMinutes)
                .startingCash(session.getStartingCash())
                .expectedCash(expectedCash)
                .countedCash(session.getEndingCash())
                .variance(session.getVariance())
                .varianceStatus(varianceStatus)
                .totalTransactions(transactions.size())
                .saleCount(countTransactions(transactions, CashTransactionType.SALE))
                .refundCount(countTransactions(transactions, CashTransactionType.REFUND))
                .dropCount(countTransactions(transactions, CashTransactionType.DROP))
                .payoutCount(countTransactions(transactions, CashTransactionType.PAYOUT))
                .noSaleCount(countTransactions(transactions, CashTransactionType.NO_SALE))
                .totalSales(calculateTransactionTotal(transactions, CashTransactionType.SALE))
                .totalRefunds(calculateTransactionTotal(transactions, CashTransactionType.REFUND).abs())
                .totalDrops(calculateTransactionTotal(transactions, CashTransactionType.DROP).abs())
                .totalPayouts(calculateTransactionTotal(transactions, CashTransactionType.PAYOUT).abs())
                .reconciliationNotes(session.getNotes())
                .hasLargeVariance(session.getVariance() != null && session.getVariance().abs().compareTo(BigDecimal.TEN) > 0)
                .build();
    }

    private VarianceReportDTO buildVarianceReport(CashReconciliation reconciliation) {
        CashDrawerSession session = reconciliation.getSession();

        BigDecimal variancePercentage = BigDecimal.ZERO;
        if (reconciliation.getExpectedCash().compareTo(BigDecimal.ZERO) > 0) {
            variancePercentage = reconciliation.getVariance()
                    .divide(reconciliation.getExpectedCash(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        String severityLevel = determineSeverityLevel(reconciliation.getVariance(), variancePercentage);

        return VarianceReportDTO.builder()
                .sessionId(session.getId())
                .reconciliationId(reconciliation.getId())
                .date(LocalDateTime.ofInstant(reconciliation.getReconciledAt(), ZoneId.systemDefault()).toLocalDate())
                .closedAt(LocalDateTime.ofInstant(reconciliation.getReconciledAt(), ZoneId.systemDefault()))
                .drawerName("Drawer " + session.getCashDrawerId())
                .userName("User " + session.getUserId())
                .expectedCash(reconciliation.getExpectedCash())
                .countedCash(reconciliation.getCountedCash())
                .variance(reconciliation.getVariance())
                .varianceStatus(reconciliation.getStatus())
                .reason(reconciliation.getVarianceReason())
                .notes(session.getNotes())
                .investigated(false)
                .resolved(false)
                .variancePercentage(variancePercentage)
                .severityLevel(severityLevel)
                .build();
    }

    private DailyCashFlowDTO generateDailyCashFlow(LocalDate date) {
        Instant startOfDay = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = date.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant();

        List<CashDrawerSession> sessions = sessionRepository.findByOpenedAtBetween(startOfDay, endOfDay);

        if (sessions.isEmpty()) {
            return DailyCashFlowDTO.builder()
                    .date(date)
                    .openingBalance(BigDecimal.ZERO)
                    .closingBalance(BigDecimal.ZERO)
                    .sales(BigDecimal.ZERO)
                    .refunds(BigDecimal.ZERO)
                    .drops(BigDecimal.ZERO)
                    .payouts(BigDecimal.ZERO)
                    .netFlow(BigDecimal.ZERO)
                    .transactionCount(0)
                    .build();
        }

        List<Long> sessionIds = sessions.stream().map(CashDrawerSession::getId).collect(Collectors.toList());
        List<CashTransaction> transactions = transactionRepository.findBySessionIdIn(sessionIds);

        BigDecimal openingBalance = sessions.stream()
                .map(CashDrawerSession::getStartingCash)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal sales = calculateTransactionTotal(transactions, CashTransactionType.SALE);
        BigDecimal refunds = calculateTransactionTotal(transactions, CashTransactionType.REFUND).abs();
        BigDecimal drops = calculateTransactionTotal(transactions, CashTransactionType.DROP).abs();
        BigDecimal payouts = calculateTransactionTotal(transactions, CashTransactionType.PAYOUT).abs();

        BigDecimal netFlow = sales.subtract(refunds).subtract(drops).subtract(payouts);
        BigDecimal closingBalance = openingBalance.add(netFlow);

        return DailyCashFlowDTO.builder()
                .date(date)
                .openingBalance(openingBalance)
                .closingBalance(closingBalance)
                .sales(sales)
                .refunds(refunds)
                .drops(drops)
                .payouts(payouts)
                .netFlow(netFlow)
                .transactionCount(transactions.size())
                .build();
    }

    private BigDecimal calculateTransactionTotal(List<CashTransaction> transactions, CashTransactionType type) {
        return transactions.stream()
                .filter(t -> t.getType() == type)
                .map(CashTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int countTransactions(List<CashTransaction> transactions, CashTransactionType type) {
        return (int) transactions.stream()
                .filter(t -> t.getType() == type)
                .count();
    }

    private String determineSeverityLevel(BigDecimal variance, BigDecimal variancePercentage) {
        BigDecimal absVariance = variance.abs();
        BigDecimal absPercentage = variancePercentage.abs();

        if (absVariance.compareTo(BigDecimal.valueOf(100)) >= 0 || absPercentage.compareTo(BigDecimal.TEN) >= 0) {
            return "HIGH";
        } else if (absVariance.compareTo(BigDecimal.valueOf(50)) >= 0 || absPercentage.compareTo(BigDecimal.valueOf(5)) >= 0) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
}
