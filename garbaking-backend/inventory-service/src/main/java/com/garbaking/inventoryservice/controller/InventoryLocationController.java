package com.garbaking.inventoryservice.controller;

import com.garbaking.inventoryservice.model.InventoryLocation;
import com.garbaking.inventoryservice.repository.InventoryLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/locations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InventoryLocationController {

    private final InventoryLocationRepository locationRepository;

    @GetMapping
    public ResponseEntity<List<InventoryLocation>> getAllLocations() {
        log.info("GET /api/inventory/locations");
        List<InventoryLocation> locations = locationRepository.findAll();
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/active")
    public ResponseEntity<List<InventoryLocation>> getActiveLocations() {
        log.info("GET /api/inventory/locations/active");
        List<InventoryLocation> locations = locationRepository.findByIsActiveTrue();
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryLocation> getLocationById(@PathVariable Long id) {
        log.info("GET /api/inventory/locations/{}", id);
        InventoryLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        return ResponseEntity.ok(location);
    }

    @GetMapping("/primary")
    public ResponseEntity<InventoryLocation> getPrimaryLocation() {
        log.info("GET /api/inventory/locations/primary");
        InventoryLocation location = locationRepository.findByIsPrimaryTrue()
                .orElseThrow(() -> new RuntimeException("No primary location found"));
        return ResponseEntity.ok(location);
    }
}
