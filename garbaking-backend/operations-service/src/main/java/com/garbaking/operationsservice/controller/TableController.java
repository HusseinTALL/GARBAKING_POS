package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.ReservationRequest;
import com.garbaking.operationsservice.dto.ReservationStatusUpdateRequest;
import com.garbaking.operationsservice.dto.TableStatusUpdateRequest;
import com.garbaking.operationsservice.model.FloorSection;
import com.garbaking.operationsservice.model.Reservation;
import com.garbaking.operationsservice.service.TableManagementService;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final TableManagementService tableManagementService;

    public TableController(TableManagementService tableManagementService) {
        this.tableManagementService = tableManagementService;
    }

    @GetMapping("/layout")
    public List<FloorSection> getLayout() {
        return tableManagementService.getLayout();
    }

    @PutMapping("/{tableId}/status")
    public void updateStatus(@PathVariable Long tableId, @Valid @RequestBody TableStatusUpdateRequest request) {
        tableManagementService.updateTableStatus(tableId, request);
    }

    @PostMapping("/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    public Reservation createReservation(@Valid @RequestBody ReservationRequest request) {
        return tableManagementService.createReservation(request);
    }

    @PutMapping("/reservations/{reservationId}/status")
    public Reservation updateReservationStatus(
        @PathVariable Long reservationId,
        @Valid @RequestBody ReservationStatusUpdateRequest request
    ) {
        return tableManagementService.updateReservationStatus(reservationId, request);
    }

    @GetMapping("/reservations")
    public List<Reservation> listReservations() {
        return tableManagementService.listReservations();
    }

    @GetMapping("/reservations/active")
    public Optional<Reservation> getActiveReservation(@RequestParam Long tableId, @RequestParam Instant at) {
        return tableManagementService.findActiveReservationForTable(tableId, at);
    }
}
