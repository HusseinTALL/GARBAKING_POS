package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.AvailabilityWindowDTO;
import com.garbaking.employeeservice.dto.SetAvailabilityRequest;
import com.garbaking.employeeservice.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

/**
 * REST Controller for Employee Availability operations
 */
@RestController
@RequestMapping("/api/employees/availability")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @PostMapping
    public ResponseEntity<AvailabilityWindowDTO> setAvailability(
            @Valid @RequestBody SetAvailabilityRequest request
    ) {
        log.info("POST /api/employees/availability - Employee: {}, Day: {}",
                request.getEmployeeId(), request.getDayOfWeek());
        AvailabilityWindowDTO availability = availabilityService.setAvailability(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(availability);
    }

    @DeleteMapping("/{availabilityId}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Long availabilityId) {
        log.info("DELETE /api/employees/availability/{}", availabilityId);
        availabilityService.deleteAvailability(availabilityId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/employee/{employeeId}/clear")
    public ResponseEntity<Void> clearEmployeeAvailability(@PathVariable Long employeeId) {
        log.info("DELETE /api/employees/availability/employee/{}/clear", employeeId);
        availabilityService.clearEmployeeAvailability(employeeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{availabilityId}")
    public ResponseEntity<AvailabilityWindowDTO> getAvailabilityById(
            @PathVariable Long availabilityId
    ) {
        log.info("GET /api/employees/availability/{}", availabilityId);
        AvailabilityWindowDTO availability = availabilityService.getAvailabilityById(availabilityId);
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AvailabilityWindowDTO>> getEmployeeAvailability(
            @PathVariable Long employeeId
    ) {
        log.info("GET /api/employees/availability/employee/{}", employeeId);
        List<AvailabilityWindowDTO> availability = availabilityService.getEmployeeAvailability(employeeId);
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/employee/{employeeId}/day/{dayOfWeek}")
    public ResponseEntity<AvailabilityWindowDTO> getEmployeeAvailabilityForDay(
            @PathVariable Long employeeId,
            @PathVariable DayOfWeek dayOfWeek
    ) {
        log.info("GET /api/employees/availability/employee/{}/day/{}", employeeId, dayOfWeek);
        AvailabilityWindowDTO availability = availabilityService.getEmployeeAvailabilityForDay(
                employeeId, dayOfWeek);
        if (availability == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/day/{dayOfWeek}")
    public ResponseEntity<List<AvailabilityWindowDTO>> getAvailableEmployeesForDay(
            @PathVariable DayOfWeek dayOfWeek
    ) {
        log.info("GET /api/employees/availability/day/{}", dayOfWeek);
        List<AvailabilityWindowDTO> availability = availabilityService.getAvailableEmployeesForDay(dayOfWeek);
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/employee/{employeeId}/check/{dayOfWeek}")
    public ResponseEntity<Boolean> isEmployeeAvailableOnDay(
            @PathVariable Long employeeId,
            @PathVariable DayOfWeek dayOfWeek
    ) {
        log.info("GET /api/employees/availability/employee/{}/check/{}", employeeId, dayOfWeek);
        boolean isAvailable = availabilityService.isEmployeeAvailableOnDay(employeeId, dayOfWeek);
        return ResponseEntity.ok(isAvailable);
    }

    @GetMapping("/employee/{employeeId}/unavailable")
    public ResponseEntity<List<AvailabilityWindowDTO>> getUnavailableDays(
            @PathVariable Long employeeId
    ) {
        log.info("GET /api/employees/availability/employee/{}/unavailable", employeeId);
        List<AvailabilityWindowDTO> unavailableDays = availabilityService.getUnavailableDays(employeeId);
        return ResponseEntity.ok(unavailableDays);
    }
}
