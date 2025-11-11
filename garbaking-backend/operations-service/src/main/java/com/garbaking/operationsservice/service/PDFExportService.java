package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.report.DailyCashReportDTO;
import com.garbaking.operationsservice.dto.report.SessionSummaryDTO;
import com.garbaking.operationsservice.dto.report.VarianceReportDTO;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for exporting reports to PDF format using iText7
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PDFExportService {

    private final CashReportService reportService;

    // Brand colors
    private static final DeviceRgb PRIMARY_COLOR = new DeviceRgb(34, 197, 94); // Green
    private static final DeviceRgb SECONDARY_COLOR = new DeviceRgb(59, 130, 246); // Blue
    private static final DeviceRgb DANGER_COLOR = new DeviceRgb(239, 68, 68); // Red
    private static final DeviceRgb WARNING_COLOR = new DeviceRgb(251, 191, 36); // Yellow
    private static final DeviceRgb GRAY_COLOR = new DeviceRgb(156, 163, 175); // Gray

    /**
     * Export daily cash report to PDF
     */
    public byte[] exportDailyReportToPDF(LocalDate date) {
        log.info("Exporting daily cash report to PDF for date: {}", date);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Get report data
            DailyCashReportDTO report = reportService.generateDailyReport(date);

            // Title
            addTitle(document, "Daily Cash Report", date.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));

            // Summary Section
            addSectionTitle(document, "Summary");
            addSummaryTable(document, report);

            // Transaction Breakdown
            addSectionTitle(document, "Transaction Breakdown");
            addTransactionTable(document, report);

            // Variance Summary
            if (report.getTotalSessions() > 0) {
                addSectionTitle(document, "Variance Summary");
                addVarianceTable(document, report);
            }

            // Session Details
            if (report.getSessions() != null && !report.getSessions().isEmpty()) {
                addSectionTitle(document, "Session Details");
                addSessionsTable(document, report.getSessions());
            }

            // Footer
            addFooter(document);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to export daily report to PDF", e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    /**
     * Export variance report to PDF
     */
    public byte[] exportVarianceReportToPDF(LocalDate startDate, LocalDate endDate) {
        log.info("Exporting variance report to PDF from {} to {}", startDate, endDate);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Get report data
            List<VarianceReportDTO> variances = reportService.getVarianceReport(startDate, endDate);

            // Title
            addTitle(document, "Variance Report",
                    String.format("%s to %s",
                            startDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
                            endDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))));

            // Variance Details
            addSectionTitle(document, "Variance Details");
            addVarianceDetailsTable(document, variances);

            // Footer
            addFooter(document);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to export variance report to PDF", e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    // Helper methods for PDF generation

    private void addTitle(Document document, String title, String subtitle) {
        // Company name
        Paragraph company = new Paragraph("GARBAKING POS")
                .setFontSize(24)
                .setBold()
                .setFontColor(PRIMARY_COLOR)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(company);

        // Report title
        Paragraph reportTitle = new Paragraph(title)
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(reportTitle);

        // Subtitle
        Paragraph sub = new Paragraph(subtitle)
                .setFontSize(12)
                .setFontColor(GRAY_COLOR)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(sub);
    }

    private void addSectionTitle(Document document, String title) {
        Paragraph section = new Paragraph(title)
                .setFontSize(14)
                .setBold()
                .setFontColor(SECONDARY_COLOR)
                .setMarginTop(15)
                .setMarginBottom(10);
        document.add(section);
    }

    private void addSummaryTable(Document document, DailyCashReportDTO report) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2}))
                .useAllAvailableWidth();

        // Headers
        addTableHeader(table, "Metric", "Amount");

        // Data rows
        addTableRow(table, "Total Sessions", String.valueOf(report.getTotalSessions()));
        addTableRow(table, "Open Sessions", String.valueOf(report.getOpenSessions()));
        addTableRow(table, "Closed Sessions", String.valueOf(report.getClosedSessions()));
        addTableRow(table, "Total Starting Cash", formatCurrency(report.getTotalStartingCash()));
        addTableRow(table, "Total Ending Cash", formatCurrency(report.getTotalEndingCash()));
        addTableRow(table, "Total Sales", formatCurrency(report.getTotalSales()), PRIMARY_COLOR);
        addTableRow(table, "Total Refunds", formatCurrency(report.getTotalRefunds()), DANGER_COLOR);
        addTableRow(table, "Total Drops", formatCurrency(report.getTotalDrops()), SECONDARY_COLOR);
        addTableRow(table, "Total Payouts", formatCurrency(report.getTotalPayouts()), WARNING_COLOR);
        addTableRow(table, "Net Cash Flow", formatCurrency(report.getNetCashFlow()), PRIMARY_COLOR);

        document.add(table);
    }

    private void addTransactionTable(Document document, DailyCashReportDTO report) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 1, 2}))
                .useAllAvailableWidth();

        addTableHeader(table, "Transaction Type", "Count", "Amount");

        addTableRow(table, "Sales", String.valueOf(report.getSaleCount()), formatCurrency(report.getTotalSales()));
        addTableRow(table, "Refunds", String.valueOf(report.getRefundCount()), formatCurrency(report.getTotalRefunds()));
        addTableRow(table, "Drops", String.valueOf(report.getDropCount()), formatCurrency(report.getTotalDrops()));
        addTableRow(table, "Payouts", String.valueOf(report.getPayoutCount()), formatCurrency(report.getTotalPayouts()));
        addTableRow(table, "No Sale", String.valueOf(report.getNoSaleCount()), "-");

        document.add(table);
    }

    private void addVarianceTable(Document document, DailyCashReportDTO report) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2}))
                .useAllAvailableWidth();

        addTableHeader(table, "Variance Metric", "Value");

        addTableRow(table, "Total Variance", formatCurrency(report.getTotalVariance()),
                report.getTotalVariance().compareTo(BigDecimal.ZERO) < 0 ? DANGER_COLOR : WARNING_COLOR);
        addTableRow(table, "Balanced Sessions", String.valueOf(report.getBalancedSessions()));
        addTableRow(table, "Short Sessions", String.valueOf(report.getShortSessions()), DANGER_COLOR);
        addTableRow(table, "Over Sessions", String.valueOf(report.getOverSessions()), WARNING_COLOR);
        addTableRow(table, "Total Shortage", formatCurrency(report.getTotalShortage()), DANGER_COLOR);
        addTableRow(table, "Total Overage", formatCurrency(report.getTotalOverage()), WARNING_COLOR);

        document.add(table);
    }

    private void addSessionsTable(Document document, List<SessionSummaryDTO> sessions) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2, 2, 2, 2}))
                .useAllAvailableWidth();

        addTableHeader(table, "Session", "Status", "Expected", "Counted", "Variance");

        for (SessionSummaryDTO session : sessions) {
            table.addCell(createCell("#" + session.getSessionId()));
            table.addCell(createCell(String.valueOf(session.getStatus())));
            table.addCell(createCell(formatCurrency(session.getExpectedCash())));
            table.addCell(createCell(session.getCountedCash() != null ?
                    formatCurrency(session.getCountedCash()) : "-"));

            String varianceText = session.getVariance() != null ?
                    formatCurrency(session.getVariance()) : "-";
            DeviceRgb color = session.getVariance() != null &&
                    session.getVariance().compareTo(BigDecimal.ZERO) < 0 ?
                    DANGER_COLOR : WARNING_COLOR;
            table.addCell(createCell(varianceText, color));
        }

        document.add(table);
    }

    private void addVarianceDetailsTable(Document document, List<VarianceReportDTO> variances) {
        if (variances.isEmpty()) {
            document.add(new Paragraph("No variances found for this period.")
                    .setFontColor(GRAY_COLOR)
                    .setTextAlignment(TextAlignment.CENTER));
            return;
        }

        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2, 2, 2, 2, 1}))
                .useAllAvailableWidth();

        addTableHeader(table, "Date", "Drawer", "Expected", "Counted", "Variance", "Severity");

        for (VarianceReportDTO variance : variances) {
            table.addCell(createCell(variance.getDate().format(DateTimeFormatter.ofPattern("MM/dd/yyyy"))));
            table.addCell(createCell(variance.getDrawerName()));
            table.addCell(createCell(formatCurrency(variance.getExpectedCash())));
            table.addCell(createCell(formatCurrency(variance.getCountedCash())));

            DeviceRgb color = variance.getVariance().compareTo(BigDecimal.ZERO) < 0 ?
                    DANGER_COLOR : WARNING_COLOR;
            table.addCell(createCell(formatCurrency(variance.getVariance()), color));
            table.addCell(createCell(variance.getSeverityLevel()));
        }

        document.add(table);
    }

    private void addTableHeader(Table table, String... headers) {
        for (String header : headers) {
            Cell cell = new Cell()
                    .add(new Paragraph(header).setBold())
                    .setBackgroundColor(new DeviceRgb(243, 244, 246))
                    .setTextAlignment(TextAlignment.CENTER);
            table.addHeaderCell(cell);
        }
    }

    private void addTableRow(Table table, String label, String value) {
        table.addCell(createCell(label));
        table.addCell(createCell(value));
    }

    private void addTableRow(Table table, String label, String value, DeviceRgb color) {
        table.addCell(createCell(label));
        table.addCell(createCell(value, color));
    }

    private void addTableRow(Table table, String col1, String col2, String col3) {
        table.addCell(createCell(col1));
        table.addCell(createCell(col2));
        table.addCell(createCell(col3));
    }

    private Cell createCell(String text) {
        return new Cell().add(new Paragraph(text)).setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createCell(String text, DeviceRgb color) {
        return new Cell()
                .add(new Paragraph(text).setFontColor(color).setBold())
                .setTextAlignment(TextAlignment.CENTER);
    }

    private void addFooter(Document document) {
        Paragraph footer = new Paragraph(
                String.format("Generated on %s by Garbaking POS System",
                        LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))))
                .setFontSize(8)
                .setFontColor(GRAY_COLOR)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30);
        document.add(footer);
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "$0.00";
        return String.format("$%,.2f", amount);
    }
}
