package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.model.LoyaltyMember;
import com.garbaking.operationsservice.model.LoyaltyTier;
import com.garbaking.operationsservice.model.LoyaltyTransaction;
import com.garbaking.operationsservice.model.LoyaltyTransactionType;
import com.garbaking.operationsservice.model.OperationsSummary;
import com.garbaking.operationsservice.model.PaymentStatus;
import com.garbaking.operationsservice.model.PaymentTransaction;
import com.garbaking.operationsservice.model.PrinterDevice;
import com.garbaking.operationsservice.model.PrinterJob;
import com.garbaking.operationsservice.model.PrinterJobStatus;
import com.garbaking.operationsservice.model.PrinterStatus;
import com.garbaking.operationsservice.model.Receipt;
import com.garbaking.operationsservice.model.Reservation;
import com.garbaking.operationsservice.model.ReservationStatus;
import com.garbaking.operationsservice.model.TableStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class OperationsSummaryService {

    private final LoyaltyService loyaltyService;
    private final TableManagementService tableManagementService;
    private final ReceiptService receiptService;
    private final PrinterService printerService;
    private final PaymentService paymentService;

    public OperationsSummaryService(
        LoyaltyService loyaltyService,
        TableManagementService tableManagementService,
        ReceiptService receiptService,
        PrinterService printerService,
        PaymentService paymentService
    ) {
        this.loyaltyService = loyaltyService;
        this.tableManagementService = tableManagementService;
        this.receiptService = receiptService;
        this.printerService = printerService;
        this.paymentService = paymentService;
    }

    public OperationsSummary buildSummary() {
        List<LoyaltyMember> members = loyaltyService.listMembers();
        Map<LoyaltyTier, Integer> tierDistribution = new EnumMap<>(LoyaltyTier.class);
        int activeMembers = 0;
        int loyaltyRedemptionsToday = 0;
        LocalDate today = LocalDate.now();
        for (LoyaltyMember member : members) {
            tierDistribution.merge(member.getTier(), 1, Integer::sum);
            if (member.getLastActivityAt() != null && member.getLastActivityAt().isAfter(Instant.now().minusSeconds(86_400))) {
                activeMembers++;
            }
            List<LoyaltyTransaction> memberTransactions = loyaltyService.getTransactionsForMember(member.getId());
            for (LoyaltyTransaction transaction : memberTransactions) {
                if (
                    transaction.getType() == LoyaltyTransactionType.REDEEM &&
                    transaction.getOccurredAt().isAfter(today.atStartOfDay().toInstant(ZoneOffset.UTC))
                ) {
                    loyaltyRedemptionsToday++;
                }
            }
        }

        int availableTables = 0;
        int occupiedTables = 0;
        int openReservations = 0;
        int reservationsToday = 0;
        for (var entry : tableManagementService.getTableStore().entrySet()) {
            TableStatus status = entry.getValue().getStatus();
            if (status == TableStatus.AVAILABLE) {
                availableTables++;
            } else if (status == TableStatus.OCCUPIED) {
                occupiedTables++;
            }
        }
        for (Reservation reservation : tableManagementService.getReservationStore().values()) {
            if (reservation.getStartTime().isAfter(Instant.now().minusSeconds(43_200))) {
                reservationsToday++;
            }
            if (reservation.getStatus() == ReservationStatus.CONFIRMED || reservation.getStatus() == ReservationStatus.CHECKED_IN) {
                openReservations++;
            }
        }

        int receiptsGeneratedToday = 0;
        BigDecimal receiptVolume = BigDecimal.ZERO;
        for (Receipt receipt : receiptService.getReceiptStore().values()) {
            if (receipt.getGeneratedAt().isAfter(Instant.now().minusSeconds(86_400))) {
                receiptsGeneratedToday++;
                receiptVolume = receiptVolume.add(receipt.getTotal());
            }
        }

        int printerJobsQueued = 0;
        int printersOffline = 0;
        for (Map.Entry<Long, java.util.Deque<PrinterJob>> entry : printerService.getPrinterQueues().entrySet()) {
            printerJobsQueued += (int) entry
                .getValue()
                .stream()
                .filter(job -> job.getStatus() == PrinterJobStatus.QUEUED)
                .count();
        }
        for (PrinterDevice device : printerService.listPrinters()) {
            if (device.getStatus() == PrinterStatus.OFFLINE) {
                printersOffline++;
            }
        }

        BigDecimal paymentsCollectedToday = BigDecimal.ZERO;
        BigDecimal refundsProcessedToday = BigDecimal.ZERO;
        Map<String, BigDecimal> paymentBreakdown = new HashMap<>();
        for (PaymentTransaction transaction : paymentService.listTransactions()) {
            if (transaction.getProcessedAt().isAfter(Instant.now().minusSeconds(86_400))) {
                if (transaction.getStatus() == PaymentStatus.CAPTURED) {
                    paymentsCollectedToday = paymentsCollectedToday.add(transaction.getAmount());
                    paymentBreakdown.merge(transaction.getPaymentMethod(), transaction.getAmount(), BigDecimal::add);
                }
                if (transaction.getStatus() == PaymentStatus.REFUNDED) {
                    refundsProcessedToday = refundsProcessedToday.add(transaction.getAmount().abs());
                }
            }
        }

        return OperationsSummary
            .builder()
            .generatedAt(Instant.now())
            .totalLoyaltyMembers(members.size())
            .activeLoyaltyMembers(activeMembers)
            .loyaltyTierDistribution(convertTierDistribution(tierDistribution))
            .totalReservationsToday(reservationsToday)
            .openReservations(openReservations)
            .availableTables(availableTables)
            .occupiedTables(occupiedTables)
            .receiptsGeneratedToday(receiptsGeneratedToday)
            .receiptVolume(receiptVolume)
            .printerJobsQueued(printerJobsQueued)
            .printersOffline(printersOffline)
            .paymentsCollectedToday(paymentsCollectedToday)
            .refundsProcessedToday(refundsProcessedToday)
            .paymentBreakdown(paymentBreakdown)
            .loyaltyRedemptionsToday(loyaltyRedemptionsToday)
            .build();
    }

    private Map<String, Integer> convertTierDistribution(Map<LoyaltyTier, Integer> tierDistribution) {
        Map<String, Integer> result = new HashMap<>();
        for (Map.Entry<LoyaltyTier, Integer> entry : tierDistribution.entrySet()) {
            result.put(entry.getKey().name(), entry.getValue());
        }
        return result;
    }
}
