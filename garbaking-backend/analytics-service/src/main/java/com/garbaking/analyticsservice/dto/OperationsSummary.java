package com.garbaking.analyticsservice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class OperationsSummary {
    Instant generatedAt;
    int totalLoyaltyMembers;
    int activeLoyaltyMembers;
    Map<String, Integer> loyaltyTierDistribution;
    int totalReservationsToday;
    int openReservations;
    int availableTables;
    int occupiedTables;
    int receiptsGeneratedToday;
    BigDecimal receiptVolume;
    int printerJobsQueued;
    int printersOffline;
    BigDecimal paymentsCollectedToday;
    BigDecimal refundsProcessedToday;
    Map<String, BigDecimal> paymentBreakdown;
    int loyaltyRedemptionsToday;
}
