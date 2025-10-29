package com.garbaking.analyticsservice.service;

import com.garbaking.analyticsservice.dto.AnalyticsSnapshot;
import com.garbaking.analyticsservice.dto.CreateReportScheduleRequest;
import com.garbaking.analyticsservice.dto.OperationsSummary;
import com.garbaking.analyticsservice.dto.ReportExportRequest;
import com.garbaking.analyticsservice.dto.ReportExportResponse;
import com.garbaking.analyticsservice.dto.ReportFormat;
import com.garbaking.analyticsservice.dto.ReportSchedule;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class CrossCuttingAnalyticsService {

    private final OperationsClient operationsClient;
    private final AtomicReference<AnalyticsSnapshot> latestSnapshot = new AtomicReference<>();
    private final CopyOnWriteArrayList<ReportSchedule> schedules = new CopyOnWriteArrayList<>();
    private final AtomicLong scheduleIdSequence = new AtomicLong(1);

    public CrossCuttingAnalyticsService(OperationsClient operationsClient) {
        this.operationsClient = operationsClient;
    }

    public AnalyticsSnapshot getSnapshot() {
        AnalyticsSnapshot snapshot = latestSnapshot.get();
        if (snapshot == null) {
            snapshot = refreshSnapshot();
        }
        return snapshot;
    }

    public AnalyticsSnapshot refreshSnapshot() {
        OperationsSummary summary = Optional.ofNullable(operationsClient.fetchSummary()).orElseGet(() -> OperationsSummary
            .builder()
            .generatedAt(Instant.now())
            .build());
        AnalyticsSnapshot snapshot = AnalyticsSnapshot
            .builder()
            .generatedAt(Instant.now())
            .loyaltyMembers(summary.getTotalLoyaltyMembers())
            .activeMembers(summary.getActiveLoyaltyMembers())
            .loyaltyTierDistribution(summary.getLoyaltyTierDistribution())
            .reservationsToday(summary.getTotalReservationsToday())
            .openReservations(summary.getOpenReservations())
            .availableTables(summary.getAvailableTables())
            .occupiedTables(summary.getOccupiedTables())
            .receiptsGeneratedToday(summary.getReceiptsGeneratedToday())
            .receiptVolume(nullToZero(summary.getReceiptVolume()))
            .printerQueueDepth(summary.getPrinterJobsQueued())
            .offlinePrinters(summary.getPrintersOffline())
            .paymentsVolume(nullToZero(summary.getPaymentsCollectedToday()))
            .refundsVolume(nullToZero(summary.getRefundsProcessedToday()))
            .paymentBreakdown(nullToEmpty(summary.getPaymentBreakdown()))
            .redemptionsToday(summary.getLoyaltyRedemptionsToday())
            .build();
        latestSnapshot.set(snapshot);
        return snapshot;
    }

    public ReportExportResponse exportReport(ReportExportRequest request) {
        AnalyticsSnapshot snapshot = getSnapshot();
        String rendered = request.getFormat() == ReportFormat.CSV ? renderCsv(snapshot, request.getFilters()) : renderPdf(snapshot);
        return ReportExportResponse
            .builder()
            .format(request.getFormat())
            .content(Base64.getEncoder().encodeToString(rendered.getBytes(StandardCharsets.UTF_8)))
            .generatedAt(Instant.now())
            .build();
    }

    public List<ReportSchedule> listSchedules() {
        return List.copyOf(schedules);
    }

    public ReportSchedule createSchedule(CreateReportScheduleRequest request) {
        ReportSchedule schedule = ReportSchedule
            .builder()
            .id(scheduleIdSequence.getAndIncrement())
            .name(request.getName())
            .format(request.getFormat())
            .cronExpression(request.getCronExpression())
            .recipients(request.getRecipients())
            .lastRunAt(null)
            .build();
        schedules.add(schedule);
        return schedule;
    }

    public void removeSchedule(Long scheduleId) {
        schedules.removeIf(schedule -> Objects.equals(schedule.getId(), scheduleId));
    }

    @Scheduled(cron = "0 */15 * * * *")
    public void scheduledRefresh() {
        refreshSnapshot();
        schedules.replaceAll(schedule -> schedule.toBuilder().lastRunAt(Instant.now()).build());
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Map<String, BigDecimal> nullToEmpty(Map<String, BigDecimal> values) {
        return values == null ? Map.of() : values;
    }

    private String renderCsv(AnalyticsSnapshot snapshot, Map<String, String> filters) {
        StringBuilder builder = new StringBuilder();
        builder.append("Metric,Value\n");
        builder.append("Loyalty Members,").append(snapshot.getLoyaltyMembers()).append('\n');
        builder.append("Active Members,").append(snapshot.getActiveMembers()).append('\n');
        builder.append("Reservations Today,").append(snapshot.getReservationsToday()).append('\n');
        builder.append("Receipts Generated,").append(snapshot.getReceiptsGeneratedToday()).append('\n');
        builder.append("Payments Volume,").append(snapshot.getPaymentsVolume()).append('\n');
        builder.append("Refunds Volume,").append(snapshot.getRefundsVolume()).append('\n');
        if (filters != null && !filters.isEmpty()) {
            filters.forEach((key, value) -> builder.append("Filter - ").append(key).append(',').append(value).append('\n'));
        }
        return builder.toString();
    }

    private String renderPdf(AnalyticsSnapshot snapshot) {
        StringBuilder builder = new StringBuilder();
        builder
            .append("Cross-Service Analytics Report\nGenerated: ")
            .append(snapshot.getGeneratedAt())
            .append("\n\nLoyalty Members: ")
            .append(snapshot.getLoyaltyMembers())
            .append("\nActive Members: ")
            .append(snapshot.getActiveMembers())
            .append("\nReservations Today: ")
            .append(snapshot.getReservationsToday())
            .append("\nPayments Volume: ")
            .append(snapshot.getPaymentsVolume())
            .append("\nRefunds Volume: ")
            .append(snapshot.getRefundsVolume())
            .append("\nPrinter Queue Depth: ")
            .append(snapshot.getPrinterQueueDepth())
            .append("\nOffline Printers: ")
            .append(snapshot.getOfflinePrinters())
            .append('\n');
        return builder.toString();
    }
}
