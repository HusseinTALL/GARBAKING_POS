package com.garbaking.analyticsservice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AnalyticsSnapshot {
    Instant generatedAt;
    int loyaltyMembers;
    int activeMembers;
    Map<String, Integer> loyaltyTierDistribution;
    int reservationsToday;
    int openReservations;
    int availableTables;
    int occupiedTables;
    int receiptsGeneratedToday;
    BigDecimal receiptVolume;
    int printerQueueDepth;
    int offlinePrinters;
    BigDecimal paymentsVolume;
    BigDecimal refundsVolume;
    Map<String, BigDecimal> paymentBreakdown;
    int redemptionsToday;
}
