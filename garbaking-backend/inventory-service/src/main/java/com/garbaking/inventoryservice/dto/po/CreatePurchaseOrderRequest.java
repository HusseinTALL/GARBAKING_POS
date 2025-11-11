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
public class CreatePurchaseOrderRequest {

    @NotNull(message = "Supplier is required")
    private Long supplierId;

    @NotNull(message = "Delivery location is required")
    private Long deliveryLocationId;

    @NotNull(message = "Order date is required")
    private LocalDate orderDate;

    private LocalDate expectedDeliveryDate;

    @NotEmpty(message = "At least one item is required")
    private List<PurchaseOrderItemRequest> items;

    private BigDecimal taxAmount;
    private BigDecimal shippingCost;
    private String notes;
    private String createdBy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemRequest {
        @NotNull(message = "Item is required")
        private Long itemId;

        @NotNull(message = "Quantity is required")
        private BigDecimal quantityOrdered;

        @NotNull(message = "Unit cost is required")
        private BigDecimal unitCost;

        private String notes;
    }
}
