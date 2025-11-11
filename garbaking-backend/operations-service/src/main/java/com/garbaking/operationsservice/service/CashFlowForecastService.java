package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.report.DailyCashFlowDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for cash flow forecasting using historical data
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CashFlowForecastService {

    private final CashReportService reportService;

    /**
     * Generate cash flow forecast for next N days based on historical data
     */
    @Transactional(readOnly = true)
    public CashFlowForecast generateForecast(int daysAhead, int historicalDays) {
        log.info("Generating cash flow forecast for {} days ahead based on {} historical days",
                daysAhead, historicalDays);

        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(historicalDays);

        // Get historical data
        var historicalFlow = reportService.getCashFlowAnalysis(startDate, today);

        // Calculate averages and trends
        BigDecimal avgDailySales = historicalFlow.getAverageDailySales();
        BigDecimal avgDailyDrops = historicalFlow.getAverageDailyDrops();

        // Simple linear regression for trend analysis
        List<DailyCashFlowDTO> historical = historicalFlow.getDailyBreakdown();
        BigDecimal salesTrend = calculateTrend(historical, "sales");
        BigDecimal flowTrend = calculateTrend(historical, "net");

        // Generate forecast
        List<ForecastDay> forecastDays = new ArrayList<>();
        BigDecimal currentBalance = historicalFlow.getClosingBalance();

        for (int i = 1; i <= daysAhead; i++) {
            LocalDate forecastDate = today.plusDays(i);

            // Apply trend to averages
            BigDecimal forecastSales = avgDailySales.add(salesTrend.multiply(BigDecimal.valueOf(i)));
            BigDecimal forecastDrops = avgDailyDrops;
            BigDecimal forecastRefunds = avgDailySales.multiply(BigDecimal.valueOf(0.05)); // 5% refund rate
            BigDecimal forecastPayouts = BigDecimal.ZERO;

            BigDecimal forecastNetFlow = forecastSales
                    .subtract(forecastRefunds)
                    .subtract(forecastDrops)
                    .subtract(forecastPayouts);

            BigDecimal forecastBalance = currentBalance.add(forecastNetFlow);

            ForecastDay day = ForecastDay.builder()
                    .date(forecastDate)
                    .forecastSales(forecastSales.max(BigDecimal.ZERO))
                    .forecastRefunds(forecastRefunds)
                    .forecastDrops(forecastDrops)
                    .forecastPayouts(forecastPayouts)
                    .forecastNetFlow(forecastNetFlow)
                    .forecastBalance(forecastBalance)
                    .confidence(calculateConfidence(i, historical.size()))
                    .build();

            forecastDays.add(day);
            currentBalance = forecastBalance;
        }

        return CashFlowForecast.builder()
                .generatedAt(LocalDate.now())
                .forecastPeriodDays(daysAhead)
                .historicalPeriodDays(historicalDays)
                .currentBalance(historicalFlow.getClosingBalance())
                .avgDailySales(avgDailySales)
                .salesTrend(salesTrend)
                .flowTrend(flowTrend)
                .forecastDays(forecastDays)
                .totalForecastSales(forecastDays.stream()
                        .map(ForecastDay::getForecastSales)
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .projectedEndingBalance(currentBalance)
                .build();
    }

    /**
     * Calculate trend using simple linear regression
     */
    private BigDecimal calculateTrend(List<DailyCashFlowDTO> data, String metric) {
        if (data.size() < 2) return BigDecimal.ZERO;

        int n = data.size();
        BigDecimal sumX = BigDecimal.ZERO;
        BigDecimal sumY = BigDecimal.ZERO;
        BigDecimal sumXY = BigDecimal.ZERO;
        BigDecimal sumX2 = BigDecimal.ZERO;

        for (int i = 0; i < n; i++) {
            BigDecimal x = BigDecimal.valueOf(i);
            BigDecimal y = switch (metric) {
                case "sales" -> data.get(i).getSales();
                case "net" -> data.get(i).getNetFlow();
                default -> BigDecimal.ZERO;
            };

            sumX = sumX.add(x);
            sumY = sumY.add(y);
            sumXY = sumXY.add(x.multiply(y));
            sumX2 = sumX2.add(x.multiply(x));
        }

        // Calculate slope: (n*sumXY - sumX*sumY) / (n*sumX2 - sumX^2)
        BigDecimal numerator = BigDecimal.valueOf(n).multiply(sumXY).subtract(sumX.multiply(sumY));
        BigDecimal denominator = BigDecimal.valueOf(n).multiply(sumX2).subtract(sumX.multiply(sumX));

        if (denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate confidence score (0-100) based on forecast distance and data size
     */
    private int calculateConfidence(int daysAhead, int dataSize) {
        // Confidence decreases with forecast distance and increases with data size
        int baseConfidence = Math.min(100, dataSize * 2);
        int distancePenalty = daysAhead * 5;
        return Math.max(20, baseConfidence - distancePenalty);
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashFlowForecast {
        private LocalDate generatedAt;
        private Integer forecastPeriodDays;
        private Integer historicalPeriodDays;
        private BigDecimal currentBalance;
        private BigDecimal avgDailySales;
        private BigDecimal salesTrend;
        private BigDecimal flowTrend;
        private List<ForecastDay> forecastDays;
        private BigDecimal totalForecastSales;
        private BigDecimal projectedEndingBalance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastDay {
        private LocalDate date;
        private BigDecimal forecastSales;
        private BigDecimal forecastRefunds;
        private BigDecimal forecastDrops;
        private BigDecimal forecastPayouts;
        private BigDecimal forecastNetFlow;
        private BigDecimal forecastBalance;
        private Integer confidence; // 0-100
    }
}
