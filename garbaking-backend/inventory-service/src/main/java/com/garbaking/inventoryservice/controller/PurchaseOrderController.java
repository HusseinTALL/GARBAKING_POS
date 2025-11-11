package com.garbaking.inventoryservice.controller;

import com.garbaking.inventoryservice.dto.po.CreatePurchaseOrderRequest;
import com.garbaking.inventoryservice.dto.po.PurchaseOrderDTO;
import com.garbaking.inventoryservice.dto.po.ReceiveGoodsRequest;
import com.garbaking.inventoryservice.model.PurchaseOrderStatus;
import com.garbaking.inventoryservice.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/purchase-orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderDTO>> getAllPurchaseOrders(
            @RequestParam(required = false) PurchaseOrderStatus status) {
        log.info("GET /api/inventory/purchase-orders - status: {}", status);

        List<PurchaseOrderDTO> orders = status != null
                ? purchaseOrderService.getPurchaseOrdersByStatus(status)
                : purchaseOrderService.getAllPurchaseOrders();

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO> getPurchaseOrderById(@PathVariable Long id) {
        log.info("GET /api/inventory/purchase-orders/{}", id);
        PurchaseOrderDTO order = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderDTO> createPurchaseOrder(
            @Valid @RequestBody CreatePurchaseOrderRequest request) {
        log.info("POST /api/inventory/purchase-orders");
        PurchaseOrderDTO order = purchaseOrderService.createPurchaseOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<PurchaseOrderDTO> submitPurchaseOrder(@PathVariable Long id) {
        log.info("POST /api/inventory/purchase-orders/{}/submit", id);
        PurchaseOrderDTO order = purchaseOrderService.submitPurchaseOrder(id);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/receive")
    public ResponseEntity<PurchaseOrderDTO> receiveGoods(
            @Valid @RequestBody ReceiveGoodsRequest request) {
        log.info("POST /api/inventory/purchase-orders/receive");
        PurchaseOrderDTO order = purchaseOrderService.receiveGoods(request);
        return ResponseEntity.ok(order);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelPurchaseOrder(@PathVariable Long id) {
        log.info("DELETE /api/inventory/purchase-orders/{}", id);
        purchaseOrderService.cancelPurchaseOrder(id);
        return ResponseEntity.noContent().build();
    }
}
