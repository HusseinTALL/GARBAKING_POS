package com.garbaking.orderservice.service;

import com.garbaking.orderservice.dto.analytics.*;
import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.model.OrderItem;
import com.garbaking.orderservice.repository.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final Clock clock;

    private final List<ReportConfigDto> scheduledReports = new CopyOnWriteArrayList<>();
    private final AtomicInteger reportSequence = new AtomicInteger();

    @Autowired
    public AnalyticsService(OrderRepository orderRepository) {
        this(orderRepository, Clock.systemDefaultZone());
    }

    public AnalyticsService(OrderRepository orderRepository, Clock clock) {
        this.orderRepository = orderRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardAnalytics getDashboardAnalytics() {
        LocalDate today = LocalDate.now(clock);
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1).minusNanos(1);
        LocalDateTime startOfYesterday = startOfToday.minusDays(1);
        LocalDateTime endOfYesterday = startOfToday.minusNanos(1);

        List<Order> todaysOrders = loadOrders(startOfToday, endOfToday);
        List<Order> yesterdaysOrders = loadOrders(startOfYesterday, endOfYesterday);

        BigDecimal todayRevenue = calculateRevenue(todaysOrders);
        BigDecimal yesterdayRevenue = calculateRevenue(yesterdaysOrders);

        DashboardComparison comparison = DashboardComparison.builder()
                .ordersChange(calculateChangePercentage(todaysOrders.size(), yesterdaysOrders.size()))
                .revenueChange(calculateChangePercentage(todayRevenue, yesterdayRevenue))
                .build();

        DashboardPeriodMetrics todayMetrics = DashboardPeriodMetrics.builder()
                .orders(todaysOrders.size())
                .revenue(todayRevenue)
                .averageOrderValue(calculateAverage(todayRevenue, todaysOrders.size()))
                .comparison(comparison)
                .build();

        DashboardPeriodMetrics yesterdayMetrics = DashboardPeriodMetrics.builder()
                .orders(yesterdaysOrders.size())
                .revenue(yesterdayRevenue)
                .averageOrderValue(calculateAverage(yesterdayRevenue, yesterdaysOrders.size()))
                .comparison(DashboardComparison.builder().ordersChange(0).revenueChange(0).build())
                .build();

        ActiveOrdersSummary activeOrders = ActiveOrdersSummary.builder()
                .activeOrders(orderRepository.findByStatusIn(List.of(
                        Order.OrderStatus.PENDING,
                        Order.OrderStatus.CONFIRMED,
                        Order.OrderStatus.PREPARING,
                        Order.OrderStatus.READY,
                        Order.OrderStatus.OUT_FOR_DELIVERY
                )).size())
                .pendingOrders(orderRepository.countByStatus(Order.OrderStatus.PENDING))
                .preparingOrders(orderRepository.countByStatus(Order.OrderStatus.PREPARING))
                .readyOrders(orderRepository.countByStatus(Order.OrderStatus.READY))
                .build();

        List<ProductAnalytics> topProducts = buildProductAnalytics(todaysOrders).stream()
                .sorted(Comparator.comparingDouble(ProductAnalytics::revenue).reversed())
                .limit(5)
                .collect(Collectors.toList());

        return DashboardAnalytics.builder()
                .today(todayMetrics)
                .yesterday(yesterdayMetrics)
                .orders(activeOrders)
                .topMenuItems(topProducts)
                .build();
    }

    @Transactional(readOnly = true)
    public SalesData getSalesData(LocalDateTime start, LocalDateTime end) {
        List<Order> orders = loadOrders(start, end);
        return buildSalesData(orders);
    }

    @Transactional(readOnly = true)
    public MenuPerformanceResponse getMenuPerformance(int days) {
        LocalDateTime start = LocalDateTime.now(clock).minusDays(days);
        List<Order> orders = loadOrders(start, LocalDateTime.now(clock));
        List<ProductAnalytics> analytics = buildProductAnalytics(orders);
        return MenuPerformanceResponse.builder()
                .period(days + " days")
                .menuItems(analytics)
                .totalOrders(orders.size())
                .build();
    }

    @Transactional(readOnly = true)
    public PeakHoursResponse getPeakHours(int days) {
        LocalDateTime start = LocalDateTime.now(clock).minusDays(days);
        List<Order> orders = orderRepository.findByCreatedAtAfter(start);

        Map<Integer, Long> ordersByHour = orders.stream()
                .filter(order -> order.getCreatedAt() != null)
                .collect(Collectors.groupingBy(order -> order.getCreatedAt().getHour(), Collectors.counting()));

        List<TimeAnalytics> peakHours = ordersByHour.entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                .limit(8)
                .map(entry -> TimeAnalytics.builder()
                        .hour(entry.getKey())
                        .period(String.format(Locale.ENGLISH, "%02d:00", entry.getKey()))
                        .orders(entry.getValue())
                        .revenue(BigDecimal.ZERO)
                        .averageOrderValue(BigDecimal.ZERO)
                        .popularItems(List.of())
                        .staffCount(0)
                        .efficiency(0)
                        .build())
                .collect(Collectors.toList());

        return PeakHoursResponse.builder()
                .period(days + " days")
                .peakHours(peakHours)
                .build();
    }

    @Transactional(readOnly = true)
    public PaymentMethodAnalytics getPaymentMethods(int days) {
        LocalDateTime start = LocalDateTime.now(clock).minusDays(days);
        List<Order> orders = orderRepository.findByCreatedAtAfter(start);

        Map<String, Long> counts = orders.stream()
                .filter(order -> order.getPaymentMethod() != null)
                .collect(Collectors.groupingBy(order -> order.getPaymentMethod().name(), Collectors.counting()));

        Map<String, BigDecimal> revenue = orders.stream()
                .filter(order -> order.getPaymentMethod() != null && order.getTotalAmount() != null)
                .collect(Collectors.groupingBy(order -> order.getPaymentMethod().name(),
                        Collectors.mapping(Order::getTotalAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        return PaymentMethodAnalytics.builder()
                .period(days + " days")
                .counts(counts)
                .revenue(revenue)
                .build();
    }

    @Transactional(readOnly = true)
    public CustomerInsightsResponse getCustomerInsights(int days) {
        LocalDateTime start = LocalDateTime.now(clock).minusDays(days);
        List<Order> orders = orderRepository.findByCreatedAtAfter(start);
        BigDecimal revenue = calculateRevenue(orders);
        double averageOrderValue = calculateAverage(revenue, orders.size()).doubleValue();

        Map<String, Long> ordersByType = orders.stream()
                .collect(Collectors.groupingBy(order -> Optional.ofNullable(order.getOrderType())
                        .map(Enum::name).orElse("UNKNOWN"), Collectors.counting()));

        Map<String, Long> ordersByStatus = orders.stream()
                .filter(order -> order.getStatus() != null)
                .collect(Collectors.groupingBy(order -> order.getStatus().name(), Collectors.counting()));

        Map<Integer, Long> peakHours = orders.stream()
                .filter(order -> order.getCreatedAt() != null)
                .collect(Collectors.groupingBy(order -> order.getCreatedAt().getHour(), Collectors.counting()));

        List<PeakHourMetric> peakHourMetrics = peakHours.entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> PeakHourMetric.builder()
                        .hour(entry.getKey())
                        .orderCount(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        Map<String, List<Order>> ordersByCustomer = orders.stream()
                .collect(Collectors.groupingBy(this::resolveCustomerKey));

        long newCustomers = ordersByCustomer.values().stream()
                .filter(list -> list.stream().map(Order::getCreatedAt)
                        .filter(Objects::nonNull)
                        .min(LocalDateTime::compareTo)
                        .orElse(LocalDateTime.MIN)
                        .isAfter(LocalDateTime.now(clock).minusDays(days)))
                .count();

        long returningCustomers = ordersByCustomer.size() - newCustomers;

        return CustomerInsightsResponse.builder()
                .period(days + " days")
                .totalOrders(orders.size())
                .averageOrderValue(averageOrderValue)
                .ordersByType(ordersByType)
                .ordersByStatus(ordersByStatus)
                .peakHours(peakHourMetrics)
                .newCustomers(newCustomers)
                .returningCustomers(Math.max(returningCustomers, 0))
                .build();
    }

    @Transactional(readOnly = true)
    public ProductAnalyticsResponse getProductAnalytics(String period) {
        PeriodRange range = resolvePeriodRange(period);
        List<Order> orders = loadOrders(range.start(), range.end());
        return ProductAnalyticsResponse.builder()
                .period(period)
                .products(buildProductAnalytics(orders))
                .build();
    }

    @Transactional(readOnly = true)
    public CategoryAnalyticsResponse getCategoryAnalytics(String period) {
        PeriodRange range = resolvePeriodRange(period);
        List<Order> orders = loadOrders(range.start(), range.end());
        Map<String, List<ProductAnalytics>> byCategory = buildProductAnalytics(orders).stream()
                .collect(Collectors.groupingBy(ProductAnalytics::category));

        List<CategoryAnalytics> categories = byCategory.entrySet().stream()
                .map(entry -> {
                    List<ProductAnalytics> products = entry.getValue();
                    double revenue = products.stream().mapToDouble(ProductAnalytics::revenue).sum();
                    long quantity = products.stream().mapToLong(ProductAnalytics::quantitySold).sum();
                    return CategoryAnalytics.builder()
                            .categoryId(entry.getKey().toLowerCase(Locale.ENGLISH))
                            .categoryName(entry.getKey())
                            .revenue(revenue)
                            .quantitySold(quantity)
                            .profit(revenue * 0.3)
                            .orderCount(products.stream().mapToLong(ProductAnalytics::timesOrdered).sum())
                            .percentageOfTotal(0)
                            .topProducts(products.stream()
                                    .sorted(Comparator.comparingDouble(ProductAnalytics::revenue).reversed())
                                    .limit(3)
                                    .collect(Collectors.toList()))
                            .trend("stable")
                            .trendPercentage(0)
                            .build();
                })
                .sorted(Comparator.comparingDouble(CategoryAnalytics::revenue).reversed())
                .collect(Collectors.toList());

        double totalRevenue = categories.stream().mapToDouble(CategoryAnalytics::revenue).sum();
        categories = categories.stream()
                .map(cat -> CategoryAnalytics.builder()
                        .categoryId(cat.categoryId())
                        .categoryName(cat.categoryName())
                        .revenue(cat.revenue())
                        .quantitySold(cat.quantitySold())
                        .profit(cat.profit())
                        .orderCount(cat.orderCount())
                        .percentageOfTotal(totalRevenue == 0 ? 0 : (cat.revenue() / totalRevenue) * 100)
                        .topProducts(cat.topProducts())
                        .trend(cat.trend())
                        .trendPercentage(cat.trendPercentage())
                        .build())
                .collect(Collectors.toList());

        return CategoryAnalyticsResponse.builder()
                .period(period)
                .categories(categories)
                .build();
    }

    @Transactional(readOnly = true)
    public StaffPerformanceResponse getStaffPerformance(String period) {
        PeriodRange range = resolvePeriodRange(period);
        List<Order> orders = loadOrders(range.start(), range.end());

        Map<Long, List<Order>> ordersByStaff = orders.stream()
                .collect(Collectors.groupingBy(Order::getUserId));

        List<StaffPerformance> staff = ordersByStaff.entrySet().stream()
                .map(entry -> {
                    Long staffId = entry.getKey();
                    List<Order> staffOrders = entry.getValue();
                    BigDecimal revenue = calculateRevenue(staffOrders);
                    LocalDateTime first = staffOrders.stream().map(Order::getCreatedAt)
                            .filter(Objects::nonNull)
                            .min(LocalDateTime::compareTo)
                            .orElse(range.start());
                    LocalDateTime last = staffOrders.stream().map(Order::getCreatedAt)
                            .filter(Objects::nonNull)
                            .max(LocalDateTime::compareTo)
                            .orElse(range.end());
                    double hours = Math.max(Duration.between(first, last).toMinutes() / 60.0, 1.0);
                    return StaffPerformance.builder()
                            .staffId(String.valueOf(staffId))
                            .staffName("Staff " + staffId)
                            .role("STAFF")
                            .totalSales(revenue.doubleValue())
                            .totalOrders(staffOrders.size())
                            .averageOrderValue(calculateAverage(revenue, staffOrders.size()).doubleValue())
                            .hoursWorked(hours)
                            .salesPerHour(hours == 0 ? 0 : revenue.doubleValue() / hours)
                            .customerRating(null)
                            .efficiency(staffOrders.size() / hours)
                            .trend("stable")
                            .build();
                })
                .sorted(Comparator.comparingDouble(StaffPerformance::totalSales).reversed())
                .collect(Collectors.toList());

        return StaffPerformanceResponse.builder()
                .staff(staff)
                .build();
    }

    @Transactional(readOnly = true)
    public CustomerAnalyticsResponse getCustomerAnalytics(String period) {
        PeriodRange range = resolvePeriodRange(period);
        List<Order> orders = orderRepository.findByCreatedAtBetween(range.start(), range.end());
        Map<String, List<Order>> ordersByCustomer = orders.stream()
                .collect(Collectors.groupingBy(this::resolveCustomerKey));

        long totalCustomers = ordersByCustomer.size();
        long returningCustomers = ordersByCustomer.values().stream()
                .filter(list -> list.size() > 1)
                .count();
        long newCustomers = Math.max(totalCustomers - returningCustomers, 0);

        BigDecimal revenue = calculateRevenue(orders);
        double averageOrderValue = calculateAverage(revenue, orders.size()).doubleValue();
        double averageOrdersPerCustomer = totalCustomers == 0 ? 0 : (double) orders.size() / totalCustomers;
        double customerLifetimeValue = averageOrderValue * averageOrdersPerCustomer;
        double retentionRate = totalCustomers == 0 ? 0 : (double) returningCustomers / totalCustomers * 100;

        CustomerAnalytics analytics = CustomerAnalytics.builder()
                .totalCustomers(totalCustomers)
                .newCustomers(newCustomers)
                .returningCustomers(returningCustomers)
                .averageOrdersPerCustomer(averageOrdersPerCustomer)
                .customerLifetimeValue(customerLifetimeValue)
                .retentionRate(retentionRate)
                .demographics(CustomerAnalytics.Demographics.builder()
                        .ageGroups(Map.of())
                        .genderDistribution(Map.of())
                        .locationDistribution(Map.of())
                        .build())
                .build();

        return CustomerAnalyticsResponse.builder()
                .customers(analytics)
                .build();
    }

    @Transactional(readOnly = true)
    public TimeAnalyticsResponse getTimeAnalytics(String period) {
        PeriodRange range = resolvePeriodRange(period);
        List<Order> orders = loadOrders(range.start(), range.end());

        Map<Integer, List<Order>> byHour = orders.stream()
                .filter(order -> order.getCreatedAt() != null)
                .collect(Collectors.groupingBy(order -> order.getCreatedAt().getHour()));

        List<TimeAnalytics> timeData = byHour.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    int hour = entry.getKey();
                    List<Order> hourOrders = entry.getValue();
                    BigDecimal revenue = calculateRevenue(hourOrders);
                    BigDecimal average = calculateAverage(revenue, hourOrders.size());
                    List<String> popularItems = hourOrders.stream()
                            .flatMap(order -> Optional.ofNullable(order.getItems()).orElse(List.of()).stream())
                            .collect(Collectors.groupingBy(OrderItem::getMenuItemName, Collectors.counting()))
                            .entrySet().stream()
                            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                            .limit(3)
                            .map(Map.Entry::getKey)
                            .collect(Collectors.toList());

                    return TimeAnalytics.builder()
                            .hour(hour)
                            .period(String.format(Locale.ENGLISH, "%02d:00", hour))
                            .orders(hourOrders.size())
                            .revenue(revenue)
                            .averageOrderValue(average)
                            .popularItems(popularItems)
                            .staffCount(0)
                            .efficiency(0)
                            .build();
                })
                .collect(Collectors.toList());

        return TimeAnalyticsResponse.builder()
                .period(period)
                .timeData(timeData)
                .build();
    }

    @Transactional(readOnly = true)
    public ComparisonResponse getComparisonData(String period) {
        PeriodRange range = resolvePeriodRange(period);
        Duration duration = Duration.between(range.start(), range.end());
        PeriodRange previous = new PeriodRange(range.start().minus(duration), range.start());

        List<Order> currentOrders = loadOrders(range.start(), range.end());
        List<Order> previousOrders = loadOrders(previous.start(), previous.end());

        SalesData current = buildSalesData(currentOrders);
        SalesData prev = buildSalesData(previousOrders);

        ComparisonData comparison = ComparisonData.builder()
                .current(current)
                .previous(prev)
                .change(ComparisonData.ChangeMetrics.builder()
                        .sales(calculateChangePercentage(current.totalSales(), prev.totalSales()))
                        .orders(calculateChangePercentage(current.totalOrders(), prev.totalOrders()))
                        .aov(calculateChangePercentage(current.averageOrderValue(), prev.averageOrderValue()))
                        .customers(calculateChangePercentage(current.uniqueCustomers(), prev.uniqueCustomers()))
                        .build())
                .growth(ComparisonData.GrowthMetrics.builder()
                        .daily(calculateChangePercentage(current.totalSales(), prev.totalSales()))
                        .weekly(0)
                        .monthly(0)
                        .yearly(0)
                        .build())
                .build();

        return ComparisonResponse.builder()
                .comparison(comparison)
                .build();
    }

    @Transactional(readOnly = true)
    public InventoryAnalyticsResponse getInventoryAnalytics() {
        List<Order> orders = orderRepository.findByCreatedAtAfterWithItems(LocalDateTime.now(clock).minusDays(30));
        List<ProductAnalytics> analytics = buildProductAnalytics(orders);

        List<ProductAnalytics> fastMoving = analytics.stream()
                .sorted(Comparator.comparingLong(ProductAnalytics::quantitySold).reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<ProductAnalytics> slowMoving = analytics.stream()
                .sorted(Comparator.comparingLong(ProductAnalytics::quantitySold))
                .limit(5)
                .collect(Collectors.toList());

        InventoryAnalytics inventory = InventoryAnalytics.builder()
                .totalProducts(analytics.size())
                .lowStockItems(0)
                .outOfStockItems(0)
                .fastMovingItems(fastMoving)
                .slowMovingItems(slowMoving)
                .stockValue(analytics.stream().mapToDouble(ProductAnalytics::revenue).sum())
                .turnoverRate(fastMoving.stream().mapToLong(ProductAnalytics::quantitySold).sum())
                .suggestion(InventoryAnalytics.ReorderSuggestion.builder()
                        .productId("placeholder")
                        .productName("Popular Item")
                        .currentStock(10)
                        .suggestedOrder(30)
                        .priority("high")
                        .build())
                .build();

        return InventoryAnalyticsResponse.builder()
                .inventory(inventory)
                .build();
    }

    @Transactional(readOnly = true)
    public ReceiptSummaryResponse getReceiptSummary() {
        List<Order> recent = orderRepository.findByCreatedAtAfter(LocalDateTime.now(clock).minusDays(7));
        long printed = recent.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .count();
        long pending = recent.stream()
                .filter(order -> order.getStatus() != null && order.getStatus() != Order.OrderStatus.COMPLETED)
                .count();
        List<String> recentReceipts = recent.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo)).reversed())
                .limit(5)
                .map(Order::getOrderNumber)
                .collect(Collectors.toList());

        Instant lastPrintedAt = recent.stream()
                .filter(order -> order.getCompletedAt() != null)
                .map(order -> order.getCompletedAt().atZone(clock.getZone()).toInstant())
                .max(Instant::compareTo)
                .orElse(null);

        return ReceiptSummaryResponse.builder()
                .totalPrinted(printed)
                .pendingQueue(pending)
                .recentReceipts(recentReceipts)
                .lastPrintedAt(lastPrintedAt)
                .build();
    }

    @Transactional(readOnly = true)
    public PrinterQueueResponse getPrinterQueueStatus() {
        List<Order> pending = orderRepository.findByStatusIn(List.of(
                Order.OrderStatus.PENDING,
                Order.OrderStatus.CONFIRMED,
                Order.OrderStatus.PREPARING
        ));

        List<Map<String, Object>> jobs = pending.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo)))
                .limit(10)
                .map(order -> Map.<String, Object>of(
                        "orderNumber", order.getOrderNumber(),
                        "status", Optional.ofNullable(order.getStatus()).map(Enum::name).orElse("UNKNOWN"),
                        "total", Optional.ofNullable(order.getTotalAmount()).orElse(BigDecimal.ZERO),
                        "createdAt", order.getCreatedAt()))
                .collect(Collectors.toList());

        return PrinterQueueResponse.builder()
                .jobs(jobs)
                .printerOnline(true)
                .build();
    }

    @Transactional(readOnly = true)
    public LoyaltyIntegrationResponse getLoyaltyIntegrationMetrics() {
        List<Order> orders = orderRepository.findByCreatedAtAfter(LocalDateTime.now(clock).minusDays(30));
        Map<String, Object> metrics = Map.of(
                "ordersWithCustomers", orders.stream().filter(order -> order.getCustomerEmail() != null).count(),
                "estimatedPointsIssued", orders.stream()
                        .map(Order::getTotalAmount)
                        .filter(Objects::nonNull)
                        .map(total -> total.multiply(BigDecimal.valueOf(0.05)))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .setScale(2, RoundingMode.HALF_UP),
                "activeCampaigns", 0
        );

        return LoyaltyIntegrationResponse.builder()
                .enabled(true)
                .metrics(metrics)
                .build();
    }

    public GeneratedReportResponse generateReport(GenerateReportRequest request) {
        String type = Optional.ofNullable(request.getType()).orElse("UNKNOWN");
        String fileName = type.toLowerCase(Locale.ENGLISH) + "-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
                .format(LocalDateTime.now(clock)) + ".csv";

        return GeneratedReportResponse.builder()
                .type(type)
                .reportUrl("/reports/generated/" + fileName)
                .generatedAt(Instant.now(clock))
                .build();
    }

    public ScheduledReportResponse scheduleReport(ScheduleReportRequest request) {
        ReportConfigDto config = ReportConfigDto.builder()
                .id("report-" + reportSequence.incrementAndGet())
                .name(Optional.ofNullable(request.getName()).orElse("Scheduled Report"))
                .type(Optional.ofNullable(request.getType()).orElse("CUSTOM"))
                .schedule(Optional.ofNullable(request.getSchedule()).orElse("MANUAL"))
                .format(Optional.ofNullable(request.getFormat()).orElse("PDF"))
                .recipients(Optional.ofNullable(request.getRecipients()).orElse(List.of()))
                .filters(Optional.ofNullable(request.getFilters()).orElse(Map.of()))
                .isActive(request.isActive())
                .lastGenerated(null)
                .nextScheduled(Instant.now(clock).plus(Duration.ofHours(24)))
                .build();
        scheduledReports.add(config);
        return ScheduledReportResponse.builder().report(config).build();
    }

    public ReportConfigListResponse getReportConfigs() {
        return ReportConfigListResponse.builder()
                .configs(new ArrayList<>(scheduledReports))
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] exportData(String type, String period, LocalDateTime start, LocalDateTime end) {
        PeriodRange range = start != null && end != null ? new PeriodRange(start, end) : resolvePeriodRange(period);
        List<Order> orders = loadOrders(range.start(), range.end());

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(outputStream)) {
            writer.println("Order Number,Status,Total,Payment Method,Created At");
            for (Order order : orders) {
                writer.printf("%s,%s,%s,%s,%s%n",
                        order.getOrderNumber(),
                        Optional.ofNullable(order.getStatus()).map(Enum::name).orElse("UNKNOWN"),
                        Optional.ofNullable(order.getTotalAmount()).orElse(BigDecimal.ZERO),
                        Optional.ofNullable(order.getPaymentMethod()).map(Enum::name).orElse("UNKNOWN"),
                        Optional.ofNullable(order.getCreatedAt()).orElse(LocalDateTime.MIN));
            }
            writer.flush();
        }
        return outputStream.toByteArray();
    }

    @Transactional(readOnly = true)
    public ComparisonResponse getYearOverYearComparison() {
        LocalDateTime now = LocalDateTime.now(clock);
        PeriodRange currentYear = new PeriodRange(now.minusYears(1), now);
        PeriodRange previousYear = new PeriodRange(now.minusYears(2), now.minusYears(1));
        return buildComparisonResponse(currentYear, previousYear);
    }

    @Transactional(readOnly = true)
    public ComparisonResponse getMonthOverMonthComparison() {
        LocalDateTime now = LocalDateTime.now(clock);
        PeriodRange currentMonth = new PeriodRange(now.withDayOfMonth(1), now);
        PeriodRange previousMonth = new PeriodRange(now.minusMonths(1).withDayOfMonth(1), now.withDayOfMonth(1));
        return buildComparisonResponse(currentMonth, previousMonth);
    }

    @Transactional(readOnly = true)
    public ComparisonResponse getCustomComparison(LocalDateTime start1, LocalDateTime end1,
                                                  LocalDateTime start2, LocalDateTime end2) {
        return buildComparisonResponse(new PeriodRange(start1, end1), new PeriodRange(start2, end2));
    }

    private ComparisonResponse buildComparisonResponse(PeriodRange current, PeriodRange previous) {
        List<Order> currentOrders = loadOrders(current.start(), current.end());
        List<Order> previousOrders = loadOrders(previous.start(), previous.end());

        SalesData currentData = buildSalesData(currentOrders);
        SalesData previousData = buildSalesData(previousOrders);

        ComparisonData data = ComparisonData.builder()
                .current(currentData)
                .previous(previousData)
                .change(ComparisonData.ChangeMetrics.builder()
                        .sales(calculateChangePercentage(currentData.totalSales(), previousData.totalSales()))
                        .orders(calculateChangePercentage(currentData.totalOrders(), previousData.totalOrders()))
                        .aov(calculateChangePercentage(currentData.averageOrderValue(), previousData.averageOrderValue()))
                        .customers(calculateChangePercentage(currentData.uniqueCustomers(), previousData.uniqueCustomers()))
                        .build())
                .growth(ComparisonData.GrowthMetrics.builder()
                        .daily(0)
                        .weekly(0)
                        .monthly(0)
                        .yearly(0)
                        .build())
                .build();
        return ComparisonResponse.builder().comparison(data).build();
    }

    private List<ProductAnalytics> buildProductAnalytics(List<Order> orders) {
        Map<String, ItemAggregate> aggregates = orders.stream()
                .flatMap(order -> Optional.ofNullable(order.getItems()).orElse(List.of()).stream())
                .collect(Collectors.groupingBy(item -> String.valueOf(item.getMenuItemId()), Collectors.collectingAndThen(
                        Collectors.toList(), this::aggregateItem)));

        double totalRevenue = aggregates.values().stream()
                .map(ItemAggregate::revenue)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();

        return aggregates.values().stream()
                .map(aggregate -> aggregate.toProductAnalytics(totalRevenue))
                .sorted(Comparator.comparingDouble(ProductAnalytics::revenue).reversed())
                .collect(Collectors.toList());
    }

    private ItemAggregate aggregateItem(List<OrderItem> items) {
        Set<Long> orderIds = new LinkedHashSet<>();
        BigDecimal revenue = BigDecimal.ZERO;
        long quantity = 0;
        for (OrderItem item : items) {
            if (item.getOrderId() != null) {
                orderIds.add(item.getOrderId());
            }
            if (item.getSubtotal() != null) {
                revenue = revenue.add(item.getSubtotal());
            } else if (item.getUnitPrice() != null && item.getQuantity() != null) {
                revenue = revenue.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
            if (item.getQuantity() != null) {
                quantity += item.getQuantity();
            }
        }
        OrderItem sample = items.get(0);
        return new ItemAggregate(sample.getMenuItemId(), sample.getMenuItemName(), resolveCategory(sample),
                quantity, revenue, orderIds.size());
    }

    private String resolveCategory(OrderItem item) {
        String sku = Optional.ofNullable(item.getMenuItemSku()).orElse("");
        if (sku.contains("-")) {
            return sku.substring(0, sku.indexOf('-')).toUpperCase(Locale.ENGLISH);
        }
        return "GENERAL";
    }

    private List<Order> loadOrders(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return List.of();
        }
        List<Order> orders = orderRepository.findByCreatedAtBetweenWithItems(start, end);
        return new ArrayList<>(new LinkedHashSet<>(orders));
    }

    private BigDecimal calculateRevenue(List<Order> orders) {
        return orders.stream()
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateAverage(BigDecimal total, long count) {
        if (total == null || count == 0) {
            return BigDecimal.ZERO;
        }
        return total.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
    }

    private double calculateChangePercentage(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current == null || current.compareTo(BigDecimal.ZERO) == 0 ? 0 : 100;
        }
        BigDecimal difference = current.subtract(previous);
        return difference.divide(previous, 4, RoundingMode.HALF_UP).doubleValue() * 100;
    }

    private double calculateChangePercentage(long current, long previous) {
        if (previous == 0) {
            return current == 0 ? 0 : 100;
        }
        return ((double) (current - previous) / previous) * 100;
    }

    private String resolveCustomerKey(Order order) {
        return Optional.ofNullable(order.getCustomerEmail())
                .orElseGet(() -> Optional.ofNullable(order.getCustomerPhone())
                        .orElse("customer-" + Optional.ofNullable(order.getCustomerName()).orElse("unknown")));
    }

    private SalesData buildSalesData(List<Order> orders) {
        BigDecimal totalRevenue = calculateRevenue(orders);
        long orderCount = orders.size();
        long uniqueCustomers = orders.stream().map(this::resolveCustomerKey).distinct().count();

        BigDecimal taxTotal = orders.stream()
                .map(Order::getTaxAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal discountTotal = orders.stream()
                .map(Order::getDiscountAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Order.PaymentMethod, BigDecimal> revenueByPayment = orders.stream()
                .filter(order -> order.getPaymentMethod() != null)
                .collect(Collectors.groupingBy(Order::getPaymentMethod, Collectors.mapping(Order::getTotalAmount,
                        Collectors.reducing(BigDecimal.ZERO, (left, right) -> Optional.ofNullable(left).orElse(BigDecimal.ZERO)
                                .add(Optional.ofNullable(right).orElse(BigDecimal.ZERO))))));

        return SalesData.builder()
                .totalSales(totalRevenue)
                .totalOrders(orderCount)
                .averageOrderValue(calculateAverage(totalRevenue, orderCount))
                .uniqueCustomers(uniqueCustomers)
                .revenue(SalesData.RevenueBreakdown.builder()
                        .gross(totalRevenue)
                        .net(totalRevenue.subtract(discountTotal))
                        .tax(taxTotal)
                        .discounts(discountTotal)
                        .refunds(BigDecimal.ZERO)
                        .build())
                .breakdown(SalesData.PaymentBreakdown.builder()
                        .cash(revenueByPayment.getOrDefault(Order.PaymentMethod.CASH, BigDecimal.ZERO))
                        .card(revenueByPayment.getOrDefault(Order.PaymentMethod.CARD, BigDecimal.ZERO))
                        .mobileMoney(revenueByPayment.getOrDefault(Order.PaymentMethod.MOBILE_MONEY, BigDecimal.ZERO))
                        .credit(revenueByPayment.getOrDefault(Order.PaymentMethod.BANK_TRANSFER, BigDecimal.ZERO))
                        .build())
                .build();
    }

    private PeriodRange resolvePeriodRange(String period) {
        LocalDateTime now = LocalDateTime.now(clock);
        return switch (Optional.ofNullable(period).orElse("today")) {
            case "week" -> new PeriodRange(now.minusWeeks(1), now);
            case "month" -> new PeriodRange(now.minusMonths(1), now);
            case "quarter" -> new PeriodRange(now.minusMonths(3), now);
            case "year" -> new PeriodRange(now.minusYears(1), now);
            default -> new PeriodRange(now.minusDays(1), now);
        };
    }

    private record PeriodRange(LocalDateTime start, LocalDateTime end) {
    }

    private record ItemAggregate(Long productId, String productName, String category, long quantity,
                                 BigDecimal revenue, long orderCount) {
        ProductAnalytics toProductAnalytics(double totalRevenue) {
            double revenueValue = revenue.doubleValue();
            double percentage = totalRevenue == 0 ? 0 : (revenueValue / totalRevenue) * 100;
            double averagePrice = quantity == 0 ? 0 : revenueValue / quantity;
            double profit = revenueValue * 0.35;
            double profitMargin = revenueValue == 0 ? 0 : (profit / revenueValue) * 100;
            return ProductAnalytics.builder()
                    .productId(String.valueOf(productId))
                    .productName(productName)
                    .category(category)
                    .quantitySold(quantity)
                    .revenue(revenueValue)
                    .profit(profit)
                    .profitMargin(profitMargin)
                    .averagePrice(averagePrice)
                    .timesOrdered(orderCount)
                    .percentageOfTotal(percentage)
                    .trend("stable")
                    .trendPercentage(0)
                    .build();
        }
    }
}
