package com.garbaking.inventoryservice.dto.po;

import com.garbaking.inventoryservice.model.PurchaseOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDTO {

    private Long id;
    private String orderNumber;
    private Long supplierId;
    private String supplierName;
    private Long deliveryLocationId;
    private String deliveryLocationName;
    private PurchaseOrderStatus status;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private LocalDate actualDeliveryDate;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private String notes;
    private String createdBy;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String receivedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<PurchaseOrderItemDTO> items;

    // Computed fields
    private Integer totalItems;
    private Boolean canBeEdited;
    private Boolean canBeReceived;
    private Boolean isOverdue;
}
