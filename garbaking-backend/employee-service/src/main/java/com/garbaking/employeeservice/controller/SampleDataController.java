package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.service.SampleDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for sample data initialization
 * Used for testing and demonstration purposes
 */
@RestController
@RequestMapping("/api/employees/sample-data")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class SampleDataController {

    private final SampleDataService sampleDataService;

    /**
     * Initialize sample data for testing/demo purposes
     * Creates training programs, certification types, and sample records
     *
     * @return Report of data created
     */
    @PostMapping("/initialize")
    public ResponseEntity<String> initializeSampleData() {
        log.info("POST /api/employees/sample-data/initialize - Initializing sample data");
        String report = sampleDataService.initializeSampleData();
        return ResponseEntity.ok(report);
    }
}
