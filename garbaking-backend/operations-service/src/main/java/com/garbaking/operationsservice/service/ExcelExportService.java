package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelExportService {

    private final CashReportService cashReportService;
    private final CashFlowForecastService forecastService;

    public ExcelExportService(CashReportService cashReportService,
                              CashFlowForecastService forecastService) {
        this.cashReportService = cashReportService;
        this.forecastService = forecastService;
    }

    /**
     * Export daily cash report to Excel
     */
    public byte[] exportDailyReportToExcel(LocalDate date) throws IOException {
        DailyCashReportDTO report = cashReportService.getDailyReport(date);

        try (Workbook workbook = new XSSFWorkbook()) {
            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle greenStyle = createColorStyle(workbook, IndexedColors.GREEN);
            CellStyle redStyle = createColorStyle(workbook, IndexedColors.RED);
            CellStyle yellowStyle = createColorStyle(workbook, IndexedColors.YELLOW);

            // Sheet 1: Summary
            Sheet summarySheet = workbook.createSheet("Summary");
            createDailySummarySheet(summarySheet, report, titleStyle, headerStyle, currencyStyle,
                                   greenStyle, redStyle, yellowStyle);

            // Sheet 2: Sessions
            Sheet sessionsSheet = workbook.createSheet("Sessions");
            createSessionsSheet(sessionsSheet, report.getSessions(), titleStyle, headerStyle, currencyStyle,
                               greenStyle, redStyle, yellowStyle);

            // Auto-size columns
            autoSizeColumns(summarySheet, 2);
            autoSizeColumns(sessionsSheet, 10);

            // Write to byte array
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    /**
     * Export variance report to Excel
     */
    public byte[] exportVarianceReportToExcel(LocalDate startDate, LocalDate endDate) throws IOException {
        List<CashVarianceAlertDTO> alerts = cashReportService.getVarianceAlerts(startDate, endDate, null, null);

        try (Workbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);

            Sheet sheet = workbook.createSheet("Variance Alerts");
            createVarianceSheet(sheet, alerts, startDate, endDate, titleStyle, headerStyle,
                              currencyStyle, dateStyle);

            autoSizeColumns(sheet, 10);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    /**
     * Export cash flow forecast to Excel
     */
    public byte[] exportForecastToExcel(int daysAhead, int historicalDays) throws IOException {
        CashFlowForecast forecast = forecastService.generateForecast(daysAhead, historicalDays);

        try (Workbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle percentStyle = createPercentStyle(workbook);

            // Sheet 1: Forecast Data
            Sheet forecastSheet = workbook.createSheet("Forecast");
            createForecastSheet(forecastSheet, forecast, titleStyle, headerStyle, currencyStyle,
                              dateStyle, percentStyle);

            // Sheet 2: Summary
            Sheet summarySheet = workbook.createSheet("Summary");
            createForecastSummarySheet(summarySheet, forecast, titleStyle, headerStyle, currencyStyle);

            autoSizeColumns(forecastSheet, 8);
            autoSizeColumns(summarySheet, 2);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    // ==================== Sheet Creation Methods ====================

    private void createDailySummarySheet(Sheet sheet, DailyCashReportDTO report,
                                         CellStyle titleStyle, CellStyle headerStyle,
                                         CellStyle currencyStyle, CellStyle greenStyle,
                                         CellStyle redStyle, CellStyle yellowStyle) {
        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Daily Cash Report - " + report.getReportDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));
        rowNum++; // Empty row

        // Financial Summary
        createSectionHeader(sheet, rowNum++, "Financial Summary", headerStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Total Sales", report.getTotalSales(), currencyStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Total Refunds", report.getTotalRefunds(), currencyStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Total Drops", report.getTotalDrops(), currencyStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Total Payouts", report.getTotalPayouts(), currencyStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Net Cash Flow", report.getNetCashFlow(), currencyStyle);
        rowNum++; // Empty row

        // Transaction Summary
        createSectionHeader(sheet, rowNum++, "Transaction Summary", headerStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Sales Count", report.getSaleCount());
        rowNum = createLabelValueRow(sheet, rowNum, "Refund Count", report.getRefundCount());
        rowNum = createLabelValueRow(sheet, rowNum, "Drop Count", report.getDropCount());
        rowNum = createLabelValueRow(sheet, rowNum, "Payout Count", report.getPayoutCount());
        rowNum = createLabelValueRow(sheet, rowNum, "No Sale Count", report.getNoSaleCount());
        rowNum++; // Empty row

        // Session Summary
        createSectionHeader(sheet, rowNum++, "Session Summary", headerStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Total Sessions", report.getTotalSessions());
        rowNum = createLabelValueRow(sheet, rowNum, "Open Sessions", report.getOpenSessions());
        rowNum = createLabelValueRow(sheet, rowNum, "Closed Sessions", report.getClosedSessions());
        rowNum = createLabelValueRow(sheet, rowNum, "Balanced Sessions", report.getBalancedSessions());
        rowNum = createLabelValueRow(sheet, rowNum, "Short Sessions", report.getShortSessions());
        rowNum = createLabelValueRow(sheet, rowNum, "Over Sessions", report.getOverSessions());
        rowNum++; // Empty row

        // Variance Summary
        createSectionHeader(sheet, rowNum++, "Variance Summary", headerStyle);
        Row varianceRow = sheet.createRow(rowNum++);
        varianceRow.createCell(0).setCellValue("Total Variance");
        Cell varianceCell = varianceRow.createCell(1);
        varianceCell.setCellValue(report.getTotalVariance().doubleValue());
        varianceCell.setCellStyle(currencyStyle);

        // Color code based on variance
        if (report.getShortSessions() > 0) {
            varianceCell.setCellStyle(redStyle);
        } else if (report.getOverSessions() > 0) {
            varianceCell.setCellStyle(yellowStyle);
        } else {
            varianceCell.setCellStyle(greenStyle);
        }
    }

    private void createSessionsSheet(Sheet sheet, List<CashSessionSummaryDTO> sessions,
                                     CellStyle titleStyle, CellStyle headerStyle,
                                     CellStyle currencyStyle, CellStyle greenStyle,
                                     CellStyle redStyle, CellStyle yellowStyle) {
        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Session Details");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 9));
        rowNum++; // Empty row

        // Headers
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"Session ID", "User", "Drawer", "Status", "Start Time", "End Time",
                           "Expected Cash", "Actual Cash", "Variance", "Variance Status"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows
        for (CashSessionSummaryDTO session : sessions) {
            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(session.getSessionId());
            row.createCell(1).setCellValue(session.getUserName());
            row.createCell(2).setCellValue(session.getDrawerName());
            row.createCell(3).setCellValue(session.getStatus());
            row.createCell(4).setCellValue(session.getStartTime() != null ?
                session.getStartTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "");
            row.createCell(5).setCellValue(session.getEndTime() != null ?
                session.getEndTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "");

            Cell expectedCell = row.createCell(6);
            expectedCell.setCellValue(session.getExpectedCash().doubleValue());
            expectedCell.setCellStyle(currencyStyle);

            Cell actualCell = row.createCell(7);
            if (session.getActualCash() != null) {
                actualCell.setCellValue(session.getActualCash().doubleValue());
                actualCell.setCellStyle(currencyStyle);
            }

            Cell varianceCell = row.createCell(8);
            if (session.getVariance() != null) {
                varianceCell.setCellValue(session.getVariance().doubleValue());
                varianceCell.setCellStyle(currencyStyle);
            }

            Cell statusCell = row.createCell(9);
            String status = session.getVarianceStatus() != null ? session.getVarianceStatus() : "";
            statusCell.setCellValue(status);

            // Color code variance status
            if ("SHORT".equals(status)) {
                varianceCell.setCellStyle(redStyle);
                statusCell.setCellStyle(redStyle);
            } else if ("OVER".equals(status)) {
                varianceCell.setCellStyle(yellowStyle);
                statusCell.setCellStyle(yellowStyle);
            } else if ("BALANCED".equals(status)) {
                varianceCell.setCellStyle(greenStyle);
                statusCell.setCellStyle(greenStyle);
            }
        }
    }

    private void createVarianceSheet(Sheet sheet, List<CashVarianceAlertDTO> alerts,
                                     LocalDate startDate, LocalDate endDate,
                                     CellStyle titleStyle, CellStyle headerStyle,
                                     CellStyle currencyStyle, CellStyle dateStyle) {
        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Variance Alerts - " + startDate + " to " + endDate);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 9));
        rowNum++; // Empty row

        // Headers
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"Alert ID", "Session ID", "User", "Drawer", "Date", "Amount",
                           "Percentage", "Severity", "Status", "Acknowledged By"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows
        for (CashVarianceAlertDTO alert : alerts) {
            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(alert.getAlertId());
            row.createCell(1).setCellValue(alert.getSessionId());
            row.createCell(2).setCellValue(alert.getUserName());
            row.createCell(3).setCellValue(alert.getDrawerName());

            Cell dateCell = row.createCell(4);
            dateCell.setCellValue(alert.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            dateCell.setCellStyle(dateStyle);

            Cell amountCell = row.createCell(5);
            amountCell.setCellValue(alert.getVarianceAmount().doubleValue());
            amountCell.setCellStyle(currencyStyle);

            row.createCell(6).setCellValue(alert.getVariancePercentage().doubleValue() + "%");
            row.createCell(7).setCellValue(alert.getSeverity());
            row.createCell(8).setCellValue(alert.getStatus());
            row.createCell(9).setCellValue(alert.getAcknowledgedBy() != null ? alert.getAcknowledgedBy() : "");
        }
    }

    private void createForecastSheet(Sheet sheet, CashFlowForecast forecast,
                                     CellStyle titleStyle, CellStyle headerStyle,
                                     CellStyle currencyStyle, CellStyle dateStyle,
                                     CellStyle percentStyle) {
        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Cash Flow Forecast - " + forecast.getForecastDays().size() + " Days");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));
        rowNum++; // Empty row

        // Headers
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"Date", "Forecast Sales", "Forecast Refunds", "Forecast Drops",
                           "Net Flow", "Forecast Balance", "Confidence", "Day Number"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows
        for (CashFlowForecast.ForecastDay day : forecast.getForecastDays()) {
            Row row = sheet.createRow(rowNum++);

            Cell dateCell = row.createCell(0);
            dateCell.setCellValue(day.getDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
            dateCell.setCellStyle(dateStyle);

            Cell salesCell = row.createCell(1);
            salesCell.setCellValue(day.getForecastSales().doubleValue());
            salesCell.setCellStyle(currencyStyle);

            Cell refundsCell = row.createCell(2);
            refundsCell.setCellValue(day.getForecastRefunds().doubleValue());
            refundsCell.setCellStyle(currencyStyle);

            Cell dropsCell = row.createCell(3);
            dropsCell.setCellValue(day.getForecastDrops().doubleValue());
            dropsCell.setCellStyle(currencyStyle);

            Cell netFlowCell = row.createCell(4);
            netFlowCell.setCellValue(day.getNetFlow().doubleValue());
            netFlowCell.setCellStyle(currencyStyle);

            Cell balanceCell = row.createCell(5);
            balanceCell.setCellValue(day.getForecastBalance().doubleValue());
            balanceCell.setCellStyle(currencyStyle);

            Cell confidenceCell = row.createCell(6);
            confidenceCell.setCellValue(day.getConfidence() / 100.0);
            confidenceCell.setCellStyle(percentStyle);

            row.createCell(7).setCellValue(day.getDayNumber());
        }
    }

    private void createForecastSummarySheet(Sheet sheet, CashFlowForecast forecast,
                                           CellStyle titleStyle, CellStyle headerStyle,
                                           CellStyle currencyStyle) {
        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Forecast Summary");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));
        rowNum++; // Empty row

        // Summary data
        createSectionHeader(sheet, rowNum++, "Current State", headerStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Start Date",
            forecast.getStartDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
        rowNum = createLabelValueRow(sheet, rowNum, "End Date",
            forecast.getEndDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
        rowNum = createLabelValueRow(sheet, rowNum, "Current Balance",
            forecast.getCurrentBalance(), currencyStyle);
        rowNum++; // Empty row

        createSectionHeader(sheet, rowNum++, "Forecast Metrics", headerStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Average Daily Sales",
            forecast.getAverageDailySales(), currencyStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Sales Trend",
            forecast.getSalesTrend(), currencyStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Cash Flow Trend",
            forecast.getFlowTrend(), currencyStyle);
        rowNum = createLabelValueRow(sheet, rowNum, "Average Confidence",
            forecast.getAverageConfidence() + "%");
        rowNum++; // Empty row

        createSectionHeader(sheet, rowNum++, "Projected Results", headerStyle);
        BigDecimal projectedBalance = forecast.getForecastDays().isEmpty() ?
            forecast.getCurrentBalance() :
            forecast.getForecastDays().get(forecast.getForecastDays().size() - 1).getForecastBalance();
        rowNum = createLabelValueRow(sheet, rowNum, "Projected Final Balance",
            projectedBalance, currencyStyle);

        BigDecimal totalForecastSales = forecast.getForecastDays().stream()
            .map(CashFlowForecast.ForecastDay::getForecastSales)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        rowNum = createLabelValueRow(sheet, rowNum, "Total Forecast Sales",
            totalForecastSales, currencyStyle);
    }

    // ==================== Style Creation Methods ====================

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFont(font);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("$#,##0.00"));
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));
        return style;
    }

    private CellStyle createPercentStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("0%"));
        return style;
    }

    private CellStyle createColorStyle(Workbook workbook, IndexedColors color) {
        CellStyle style = createCurrencyStyle(workbook);
        Font font = workbook.createFont();
        font.setColor(color.getIndex());
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    // ==================== Helper Methods ====================

    private void createSectionHeader(Sheet sheet, int rowNum, String text, CellStyle headerStyle) {
        Row row = sheet.createRow(rowNum);
        Cell cell = row.createCell(0);
        cell.setCellValue(text);
        cell.setCellStyle(headerStyle);
    }

    private int createLabelValueRow(Sheet sheet, int rowNum, String label, Object value) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);

        Cell valueCell = row.createCell(1);
        if (value instanceof BigDecimal) {
            valueCell.setCellValue(((BigDecimal) value).doubleValue());
        } else if (value instanceof Integer) {
            valueCell.setCellValue((Integer) value);
        } else {
            valueCell.setCellValue(value.toString());
        }

        return rowNum + 1;
    }

    private int createLabelValueRow(Sheet sheet, int rowNum, String label, BigDecimal value, CellStyle currencyStyle) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);

        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value.doubleValue());
        valueCell.setCellStyle(currencyStyle);

        return rowNum + 1;
    }

    private void autoSizeColumns(Sheet sheet, int numColumns) {
        for (int i = 0; i < numColumns; i++) {
            sheet.autoSizeColumn(i);
        }
    }
}
