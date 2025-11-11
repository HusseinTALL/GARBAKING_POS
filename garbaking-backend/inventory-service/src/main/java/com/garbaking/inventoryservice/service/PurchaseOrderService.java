package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.po.*;
import com.garbaking.inventoryservice.model.*;
import com.garbaking.inventoryservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryLocationRepository locationRepository;
    private final StockLevelRepository stockLevelRepository;

    public List<PurchaseOrderDTO> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAllOrderedByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PurchaseOrderDTO> getPurchaseOrdersByStatus(PurchaseOrderStatus status) {
        return purchaseOrderRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PurchaseOrderDTO getPurchaseOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));
        return convertToDTO(po);
    }

    public PurchaseOrderDTO createPurchaseOrder(CreatePurchaseOrderRequest request) {
        log.info("Creating purchase order for supplier: {}", request.getSupplierId());

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        InventoryLocation location = locationRepository.findById(request.getDeliveryLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        // Generate PO number
        String orderNumber = generateOrderNumber();

        PurchaseOrder po = PurchaseOrder.builder()
                .orderNumber(orderNumber)
                .supplier(supplier)
                .deliveryLocation(location)
                .status(PurchaseOrderStatus.DRAFT)
                .orderDate(request.getOrderDate())
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .taxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO)
                .shippingCost(request.getShippingCost() != null ? request.getShippingCost() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .createdBy(request.getCreatedBy())
                .build();

        // Add items
        for (CreatePurchaseOrderRequest.PurchaseOrderItemRequest itemReq : request.getItems()) {
            InventoryItem item = inventoryItemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemReq.getItemId()));

            PurchaseOrderItem poItem = PurchaseOrderItem.builder()
                    .item(item)
                    .quantityOrdered(itemReq.getQuantityOrdered())
                    .unitCost(itemReq.getUnitCost())
                    .notes(itemReq.getNotes())
                    .build();

            poItem.calculateLineTotal();
            po.addItem(poItem);
        }

        po.recalculateTotals();
        po = purchaseOrderRepository.save(po);

        log.info("Created purchase order: {}", po.getOrderNumber());
        return convertToDTO(po);
    }

    public PurchaseOrderDTO submitPurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));

        if (!po.canBeEdited()) {
            throw new RuntimeException("Purchase order cannot be submitted");
        }

        po.setStatus(PurchaseOrderStatus.SUBMITTED);

        // Update stock levels to mark quantity as ordered
        for (PurchaseOrderItem item : po.getItems()) {
            StockLevel stock = stockLevelRepository.findByItemAndLocation(item.getItem(), po.getDeliveryLocation())
                    .orElseGet(() -> createInitialStockLevel(item.getItem(), po.getDeliveryLocation()));

            stock.setQuantityOrdered(stock.getQuantityOrdered().add(item.getQuantityOrdered()));
            stockLevelRepository.save(stock);
        }

        po = purchaseOrderRepository.save(po);
        log.info("Submitted purchase order: {}", po.getOrderNumber());

        return convertToDTO(po);
    }

    public PurchaseOrderDTO receiveGoods(ReceiveGoodsRequest request) {
        log.info("Receiving goods for PO: {}", request.getPurchaseOrderId());

        PurchaseOrder po = purchaseOrderRepository.findById(request.getPurchaseOrderId())
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));

        if (!po.canBeReceived()) {
            throw new RuntimeException("Purchase order cannot receive goods in current status");
        }

        LocalDate receivedDate = request.getReceivedDate() != null ?
                request.getReceivedDate() : LocalDate.now();

        // Process each received item
        for (ReceiveGoodsRequest.ReceivedItemRequest receivedItem : request.getItems()) {
            PurchaseOrderItem poItem = purchaseOrderItemRepository.findById(receivedItem.getPoItemId())
                    .orElseThrow(() -> new RuntimeException("PO item not found"));

            if (receivedItem.getQuantityReceived().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            // Update PO item received quantity
            poItem.receiveQuantity(receivedItem.getQuantityReceived());
            purchaseOrderItemRepository.save(poItem);

            // Update stock levels
            StockLevel stock = stockLevelRepository.findByItemAndLocation(
                    poItem.getItem(), po.getDeliveryLocation())
                    .orElseGet(() -> createInitialStockLevel(poItem.getItem(), po.getDeliveryLocation()));

            stock.receiveStock(receivedItem.getQuantityReceived());
            stock.setIsLowStock(poItem.getItem().isLowStock(stock.getQuantityOnHand()));
            stock.setLastCountedAt(LocalDateTime.now());
            stockLevelRepository.save(stock);

            log.info("Received {} {} of {}", receivedItem.getQuantityReceived(),
                    poItem.getItem().getUnit().getDisplayName(), poItem.getItem().getName());
        }

        // Update PO status
        po.markAsReceived();
        if (request.getReceivedBy() != null && po.getReceivedBy() == null) {
            po.setReceivedBy(request.getReceivedBy());
        }

        po = purchaseOrderRepository.save(po);
        log.info("Updated PO status to: {}", po.getStatus());

        return convertToDTO(po);
    }

    public void cancelPurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));

        if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new RuntimeException("Cannot cancel a received purchase order");
        }

        // Release ordered quantities from stock levels
        if (po.getStatus() != PurchaseOrderStatus.DRAFT) {
            for (PurchaseOrderItem item : po.getItems()) {
                StockLevel stock = stockLevelRepository.findByItemAndLocation(
                        item.getItem(), po.getDeliveryLocation()).orElse(null);

                if (stock != null) {
                    BigDecimal unreceived = item.getRemainingQuantity();
                    stock.setQuantityOrdered(stock.getQuantityOrdered().subtract(unreceived));
                    stockLevelRepository.save(stock);
                }
            }
        }

        po.setStatus(PurchaseOrderStatus.CANCELLED);
        purchaseOrderRepository.save(po);

        log.info("Cancelled purchase order: {}", po.getOrderNumber());
    }

    private String generateOrderNumber() {
        String prefix = "PO-" + LocalDate.now().getYear() + "-";
        long count = purchaseOrderRepository.count() + 1;
        return String.format("%s%04d", prefix, count);
    }

    private StockLevel createInitialStockLevel(InventoryItem item, InventoryLocation location) {
        return StockLevel.builder()
                .item(item)
                .location(location)
                .quantityOnHand(BigDecimal.ZERO)
                .quantityReserved(BigDecimal.ZERO)
                .quantityOrdered(BigDecimal.ZERO)
                .isLowStock(true)
                .build();
    }

    private PurchaseOrderDTO convertToDTO(PurchaseOrder po) {
        List<PurchaseOrderItemDTO> itemDTOs = po.getItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());

        boolean isOverdue = po.getExpectedDeliveryDate() != null &&
                po.getExpectedDeliveryDate().isBefore(LocalDate.now()) &&
                po.getStatus() != PurchaseOrderStatus.RECEIVED &&
                po.getStatus() != PurchaseOrderStatus.CANCELLED;

        return PurchaseOrderDTO.builder()
                .id(po.getId())
                .orderNumber(po.getOrderNumber())
                .supplierId(po.getSupplier().getId())
                .supplierName(po.getSupplier().getName())
                .deliveryLocationId(po.getDeliveryLocation().getId())
                .deliveryLocationName(po.getDeliveryLocation().getName())
                .status(po.getStatus())
                .orderDate(po.getOrderDate())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .actualDeliveryDate(po.getActualDeliveryDate())
                .subtotal(po.getSubtotal())
                .taxAmount(po.getTaxAmount())
                .shippingCost(po.getShippingCost())
                .totalAmount(po.getTotalAmount())
                .notes(po.getNotes())
                .createdBy(po.getCreatedBy())
                .approvedBy(po.getApprovedBy())
                .approvedAt(po.getApprovedAt())
                .receivedBy(po.getReceivedBy())
                .createdAt(po.getCreatedAt())
                .updatedAt(po.getUpdatedAt())
                .items(itemDTOs)
                .totalItems(itemDTOs.size())
                .canBeEdited(po.canBeEdited())
                .canBeReceived(po.canBeReceived())
                .isOverdue(isOverdue)
                .build();
    }

    private PurchaseOrderItemDTO convertItemToDTO(PurchaseOrderItem item) {
        return PurchaseOrderItemDTO.builder()
                .id(item.getId())
                .itemId(item.getItem().getId())
                .itemName(item.getItem().getName())
                .itemSku(item.getItem().getSku())
                .unit(item.getItem().getUnit().getDisplayName())
                .quantityOrdered(item.getQuantityOrdered())
                .quantityReceived(item.getQuantityReceived())
                .remainingQuantity(item.getRemainingQuantity())
                .unitCost(item.getUnitCost())
                .lineTotal(item.getLineTotal())
                .notes(item.getNotes())
                .fullyReceived(item.isFullyReceived())
                .build();
    }
}
