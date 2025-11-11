package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.CreateShiftRequest;
import com.garbaking.employeeservice.dto.ScheduleDTO;
import com.garbaking.employeeservice.dto.ShiftDTO;
import com.garbaking.employeeservice.dto.UpdateShiftRequest;
import com.garbaking.employeeservice.service.ShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Shift operations
 */
@RestController
@RequestMapping("/api/employees/shifts")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @PostMapping
    public ResponseEntity<ShiftDTO> createShift(@Valid @RequestBody CreateShiftRequest request) {
        log.info("POST /api/employees/shifts - Employee: {}, Date: {}",
                request.getEmployeeId(), request.getShiftDate());
        ShiftDTO shift = shiftService.createShift(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(shift);
    }

    @PutMapping("/{shiftId}")
    public ResponseEntity<ShiftDTO> updateShift(
            @PathVariable Long shiftId,
            @Valid @RequestBody UpdateShiftRequest request
    ) {
        log.info("PUT /api/employees/shifts/{} - Updating shift", shiftId);
        ShiftDTO shift = shiftService.updateShift(shiftId, request);
        return ResponseEntity.ok(shift);
    }

    @DeleteMapping("/{shiftId}")
    public ResponseEntity<Void> deleteShift(@PathVariable Long shiftId) {
        log.info("DELETE /api/employees/shifts/{}", shiftId);
        shiftService.deleteShift(shiftId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{shiftId}/complete")
    public ResponseEntity<ShiftDTO> markShiftCompleted(@PathVariable Long shiftId) {
        log.info("POST /api/employees/shifts/{}/complete", shiftId);
        ShiftDTO shift = shiftService.markShiftCompleted(shiftId);
        return ResponseEntity.ok(shift);
    }

    @PostMapping("/{shiftId}/no-show")
    public ResponseEntity<ShiftDTO> markShiftNoShow(@PathVariable Long shiftId) {
        log.info("POST /api/employees/shifts/{}/no-show", shiftId);
        ShiftDTO shift = shiftService.markShiftNoShow(shiftId);
        return ResponseEntity.ok(shift);
    }

    @PostMapping("/{shiftId}/cancel")
    public ResponseEntity<ShiftDTO> cancelShift(@PathVariable Long shiftId) {
        log.info("POST /api/employees/shifts/{}/cancel", shiftId);
        ShiftDTO shift = shiftService.cancelShift(shiftId);
        return ResponseEntity.ok(shift);
    }

    @GetMapping("/{shiftId}")
    public ResponseEntity<ShiftDTO> getShiftById(@PathVariable Long shiftId) {
        log.info("GET /api/employees/shifts/{}", shiftId);
        ShiftDTO shift = shiftService.getShiftById(shiftId);
        return ResponseEntity.ok(shift);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ShiftDTO>> getShiftsByEmployee(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        log.info("GET /api/employees/shifts/employee/{} - Start: {}, End: {}",
                employeeId, startDate, endDate);
        List<ShiftDTO> shifts = shiftService.getShiftsByEmployee(employeeId, startDate, endDate);
        return ResponseEntity.ok(shifts);
    }

    @GetMapping
    public ResponseEntity<List<ShiftDTO>> getShiftsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        log.info("GET /api/employees/shifts - Start: {}, End: {}", startDate, endDate);
        List<ShiftDTO> shifts = shiftService.getShiftsByDateRange(startDate, endDate);
        return ResponseEntity.ok(shifts);
    }

    @GetMapping("/today")
    public ResponseEntity<List<ShiftDTO>> getTodaysShifts() {
        log.info("GET /api/employees/shifts/today");
        List<ShiftDTO> shifts = shiftService.getTodaysShifts();
        return ResponseEntity.ok(shifts);
    }

    @GetMapping("/employee/{employeeId}/upcoming")
    public ResponseEntity<List<ShiftDTO>> getUpcomingShiftsByEmployee(@PathVariable Long employeeId) {
        log.info("GET /api/employees/shifts/employee/{}/upcoming", employeeId);
        List<ShiftDTO> shifts = shiftService.getUpcomingShiftsByEmployee(employeeId);
        return ResponseEntity.ok(shifts);
    }

    @GetMapping("/unassigned")
    public ResponseEntity<List<ShiftDTO>> getUnassignedShifts() {
        log.info("GET /api/employees/shifts/unassigned");
        List<ShiftDTO> shifts = shiftService.getUnassignedShifts();
        return ResponseEntity.ok(shifts);
    }

    @GetMapping("/schedule")
    public ResponseEntity<ScheduleDTO> getSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        log.info("GET /api/employees/shifts/schedule - Start: {}, End: {}", startDate, endDate);
        ScheduleDTO schedule = shiftService.getSchedule(startDate, endDate);
        return ResponseEntity.ok(schedule);
    }
}
