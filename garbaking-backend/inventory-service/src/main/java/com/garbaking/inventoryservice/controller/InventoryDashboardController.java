package com.garbaking.inventoryservice.controller;

import com.garbaking.inventoryservice.dto.inventory.InventoryDashboardDTO;
import com.garbaking.inventoryservice.service.InventoryDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InventoryDashboardController {

    private final InventoryDashboardService dashboardService;

    @GetMapping
    public ResponseEntity<InventoryDashboardDTO> getDashboard() {
        log.info("GET /api/inventory/dashboard");
        InventoryDashboardDTO dashboard = dashboardService.getDashboard();
        return ResponseEntity.ok(dashboard);
    }
}
