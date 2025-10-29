package com.garbaking.operationsservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.garbaking.operationsservice.dto.CreateLoyaltyMemberRequest;
import com.garbaking.operationsservice.dto.PaymentChargeRequest;
import com.garbaking.operationsservice.dto.ReceiptCreateRequest;
import com.garbaking.operationsservice.dto.ReservationRequest;
import com.garbaking.operationsservice.dto.TableStatusUpdateRequest;
import com.garbaking.operationsservice.model.ExportFormat;
import com.garbaking.operationsservice.model.TableStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OperationsSummaryServiceTest {

    private LoyaltyService loyaltyService;
    private TableManagementService tableManagementService;
    private ReceiptService receiptService;
    private PrinterService printerService;
    private PaymentService paymentService;
    private OperationsSummaryService operationsSummaryService;

    @BeforeEach
    void setUp() {
        loyaltyService = new LoyaltyService();
        tableManagementService = new TableManagementService();
        receiptService = new ReceiptService();
        printerService = new PrinterService();
        paymentService = new PaymentService();
        operationsSummaryService =
            new OperationsSummaryService(loyaltyService, tableManagementService, receiptService, printerService, paymentService);
    }

    @Test
    void aggregatesCoreMetrics() {
        CreateLoyaltyMemberRequest memberRequest = new CreateLoyaltyMemberRequest();
        memberRequest.setFullName("Jane Doe");
        memberRequest.setEmail("jane@example.com");
        memberRequest.setStartingPoints(1200);
        var member = loyaltyService.createMember(memberRequest);
        var redeem = new com.garbaking.operationsservice.dto.RedeemRewardRequest();
        redeem.setRewardName("Dessert");
        redeem.setPoints(200);
        loyaltyService.redeemReward(member.getId(), redeem);

        var reservation = new ReservationRequest();
        reservation.setTableId(tableManagementService.getLayout().get(0).getTables().get(0).getId());
        reservation.setCustomerName("Sam");
        reservation.setContact("sam@example.com");
        reservation.setStartTime(Instant.now());
        reservation.setEndTime(Instant.now().plus(90, ChronoUnit.MINUTES));
        reservation.setPartySize(2);
        tableManagementService.createReservation(reservation);

        TableStatusUpdateRequest statusUpdate = new TableStatusUpdateRequest();
        statusUpdate.setStatus(TableStatus.OCCUPIED);
        tableManagementService.updateTableStatus(reservation.getTableId(), statusUpdate);

        ReceiptCreateRequest receiptRequest = new ReceiptCreateRequest();
        receiptRequest.setOrderId("ORDER-1");
        receiptRequest.setTaxRate(new BigDecimal("0.07"));
        ReceiptCreateRequest.ReceiptLine line = new ReceiptCreateRequest.ReceiptLine();
        line.setName("Latte");
        line.setQuantity(2);
        line.setUnitPrice(new BigDecimal("4.50"));
        receiptRequest.setLineItems(List.of(line));
        var receipt = receiptService.generateReceipt(receiptRequest);
        receiptService.exportReceipt(receipt.getId(), createExportRequest());

        PaymentChargeRequest charge = new PaymentChargeRequest();
        charge.setOrderId("ORDER-1");
        charge.setAmount(new BigDecimal("20.00"));
        charge.setPaymentMethod("CARD");
        paymentService.charge(charge);

        var summary = operationsSummaryService.buildSummary();

        assertThat(summary.getTotalLoyaltyMembers()).isEqualTo(1);
        assertThat(summary.getActiveLoyaltyMembers()).isGreaterThanOrEqualTo(1);
        assertThat(summary.getTotalReservationsToday()).isGreaterThanOrEqualTo(1);
        assertThat(summary.getReceiptsGeneratedToday()).isEqualTo(1);
        assertThat(summary.getPaymentsCollectedToday()).isEqualByComparingTo("20.00");
        assertThat(summary.getPaymentBreakdown()).containsKey("CARD");
    }

    private com.garbaking.operationsservice.dto.ReceiptExportRequest createExportRequest() {
        var request = new com.garbaking.operationsservice.dto.ReceiptExportRequest();
        request.setFormat(ExportFormat.CSV);
        return request;
    }
}
