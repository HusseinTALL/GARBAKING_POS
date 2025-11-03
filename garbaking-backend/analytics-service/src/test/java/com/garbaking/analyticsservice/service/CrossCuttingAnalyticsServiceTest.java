package com.garbaking.analyticsservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.garbaking.analyticsservice.dto.AnalyticsSnapshot;
import com.garbaking.analyticsservice.dto.CreateReportScheduleRequest;
import com.garbaking.analyticsservice.dto.OperationsSummary;
import com.garbaking.analyticsservice.dto.ReportExportRequest;
import com.garbaking.analyticsservice.dto.ReportFormat;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CrossCuttingAnalyticsServiceTest {

    private CrossCuttingAnalyticsService analyticsService;

    @BeforeEach
    void setUp() {
        analyticsService = new CrossCuttingAnalyticsService(() -> OperationsSummary
            .builder()
            .generatedAt(Instant.now())
            .totalLoyaltyMembers(5)
            .activeLoyaltyMembers(3)
            .loyaltyTierDistribution(Map.of("GOLD", 2, "SILVER", 3))
            .totalReservationsToday(4)
            .openReservations(2)
            .availableTables(6)
            .occupiedTables(3)
            .receiptsGeneratedToday(7)
            .receiptVolume(new BigDecimal("340.12"))
            .printerJobsQueued(2)
            .printersOffline(1)
            .paymentsCollectedToday(new BigDecimal("420.50"))
            .refundsProcessedToday(new BigDecimal("10.00"))
            .paymentBreakdown(Map.of("CARD", new BigDecimal("300.00")))
            .loyaltyRedemptionsToday(2)
            .build());
    }

    @Test
    void refreshesSnapshotFromOperationsSummary() {
        AnalyticsSnapshot snapshot = analyticsService.refreshSnapshot();
        assertThat(snapshot.getLoyaltyMembers()).isEqualTo(5);
        assertThat(snapshot.getPaymentBreakdown()).containsKey("CARD");
        assertThat(snapshot.getPrinterQueueDepth()).isEqualTo(2);
    }

    @Test
    void exportsCsvReport() {
        analyticsService.refreshSnapshot();
        ReportExportRequest request = new ReportExportRequest();
        request.setFormat(ReportFormat.CSV);
        request.setFilters(Map.of("range", "last7days"));

        var response = analyticsService.exportReport(request);
        assertThat(response.getFormat()).isEqualTo(ReportFormat.CSV);
        assertThat(response.getContent()).isNotBlank();
    }

    @Test
    void managesSchedules() {
        CreateReportScheduleRequest request = new CreateReportScheduleRequest();
        request.setName("Daily rollup");
        request.setFormat(ReportFormat.PDF);
        request.setCronExpression("0 0 6 * * *");
        request.setRecipients(List.of("ops@example.com"));

        var schedule = analyticsService.createSchedule(request);
        assertThat(schedule.getId()).isNotNull();
        assertThat(analyticsService.listSchedules()).hasSize(1);

        analyticsService.removeSchedule(schedule.getId());
        assertThat(analyticsService.listSchedules()).isEmpty();
    }
}
