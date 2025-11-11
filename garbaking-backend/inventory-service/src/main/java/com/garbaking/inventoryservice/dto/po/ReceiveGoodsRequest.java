package com.garbaking.inventoryservice.dto.po;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiveGoodsRequest {

    @NotNull(message = "Purchase order ID is required")
    private Long purchaseOrderId;

    private LocalDate receivedDate;

    @NotEmpty(message = "At least one item must be received")
    private List<ReceivedItemRequest> items;

    private String receivedBy;
    private String notes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceivedItemRequest {
        @NotNull(message = "PO item ID is required")
        private Long poItemId;

        @NotNull(message = "Quantity received is required")
        private BigDecimal quantityReceived;

        private String notes;
    }
}
