package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.ReservationRequest;
import com.garbaking.operationsservice.dto.ReservationStatusUpdateRequest;
import com.garbaking.operationsservice.dto.TableStatusUpdateRequest;
import com.garbaking.operationsservice.model.DiningTable;
import com.garbaking.operationsservice.model.FloorSection;
import com.garbaking.operationsservice.model.Reservation;
import com.garbaking.operationsservice.model.ReservationStatus;
import com.garbaking.operationsservice.model.TableStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class TableManagementService {

    private final Map<Long, FloorSection> floorSections = new ConcurrentHashMap<>();
    private final Map<Long, DiningTable> tables = new ConcurrentHashMap<>();
    private final Map<Long, Reservation> reservations = new ConcurrentHashMap<>();
    private final AtomicLong sectionIdSequence = new AtomicLong(1);
    private final AtomicLong tableIdSequence = new AtomicLong(1);
    private final AtomicLong reservationIdSequence = new AtomicLong(1);

    public TableManagementService() {
        // Seed a default floor with a handful of tables for dashboards.
        FloorSection mainDining = createSection("Main Dining");
        registerTable(mainDining.getId(), "T1", 4);
        registerTable(mainDining.getId(), "T2", 4);
        registerTable(mainDining.getId(), "T3", 2);
        registerTable(mainDining.getId(), "T4", 6);
    }

    public FloorSection createSection(String name) {
        Long id = sectionIdSequence.getAndIncrement();
        FloorSection section = FloorSection.builder().id(id).name(name).build();
        floorSections.put(id, section);
        return section;
    }

    public DiningTable registerTable(Long sectionId, String label, int capacity) {
        FloorSection section = requireSection(sectionId);
        DiningTable table = DiningTable
            .builder()
            .id(tableIdSequence.getAndIncrement())
            .label(label)
            .capacity(capacity)
            .status(TableStatus.AVAILABLE)
            .build();
        tables.put(table.getId(), table);
        section.getTables().add(table);
        return table;
    }

    public List<FloorSection> getLayout() {
        return new ArrayList<>(floorSections.values());
    }

    public DiningTable updateTableStatus(Long tableId, TableStatusUpdateRequest request) {
        DiningTable table = requireTable(tableId);
        table.setStatus(request.getStatus());
        return table;
    }

    public Reservation createReservation(ReservationRequest request) {
        DiningTable table = requireTable(request.getTableId());
        if (table.getStatus() == TableStatus.OCCUPIED) {
            throw new IllegalStateException("Table is already occupied");
        }
        ensureReservationWindowIsFree(request.getTableId(), request.getStartTime(), request.getEndTime());
        Reservation reservation = Reservation
            .builder()
            .id(reservationIdSequence.getAndIncrement())
            .tableId(request.getTableId())
            .customerName(request.getCustomerName())
            .contact(request.getContact())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .partySize(request.getPartySize())
            .status(ReservationStatus.CONFIRMED)
            .build();
        reservations.put(reservation.getId(), reservation);
        table.setStatus(TableStatus.RESERVED);
        return reservation;
    }

    public Reservation updateReservationStatus(Long reservationId, ReservationStatusUpdateRequest request) {
        Reservation reservation = requireReservation(reservationId);
        reservation.setStatus(request.getStatus());
        if (request.getStatus() == ReservationStatus.CANCELLED || request.getStatus() == ReservationStatus.COMPLETED) {
            DiningTable table = tables.get(reservation.getTableId());
            if (table != null) {
                table.setStatus(TableStatus.AVAILABLE);
            }
        }
        if (request.getStatus() == ReservationStatus.CHECKED_IN) {
            DiningTable table = tables.get(reservation.getTableId());
            if (table != null) {
                table.setStatus(TableStatus.OCCUPIED);
            }
        }
        return reservation;
    }

    public List<Reservation> listReservations() {
        return new ArrayList<>(reservations.values());
    }

    public List<Reservation> listReservationsForTable(Long tableId) {
        List<Reservation> filtered = new ArrayList<>();
        for (Reservation reservation : reservations.values()) {
            if (reservation.getTableId().equals(tableId)) {
                filtered.add(reservation);
            }
        }
        return filtered;
    }

    public Optional<Reservation> findActiveReservationForTable(Long tableId, Instant at) {
        return reservations
            .values()
            .stream()
            .filter(res -> res.getTableId().equals(tableId))
            .filter(res -> res.getStartTime().compareTo(at) <= 0 && res.getEndTime().compareTo(at) >= 0)
            .findFirst();
    }

    public Map<Long, DiningTable> getTableStore() {
        return Collections.unmodifiableMap(tables);
    }

    public Map<Long, Reservation> getReservationStore() {
        return Collections.unmodifiableMap(reservations);
    }

    private FloorSection requireSection(Long sectionId) {
        FloorSection section = floorSections.get(sectionId);
        if (section == null) {
            throw new IllegalArgumentException("Floor section not found");
        }
        return section;
    }

    private DiningTable requireTable(Long tableId) {
        DiningTable table = tables.get(tableId);
        if (table == null) {
            throw new IllegalArgumentException("Table not found");
        }
        return table;
    }

    private Reservation requireReservation(Long reservationId) {
        Reservation reservation = reservations.get(reservationId);
        if (reservation == null) {
            throw new IllegalArgumentException("Reservation not found");
        }
        return reservation;
    }

    private void ensureReservationWindowIsFree(Long tableId, Instant start, Instant end) {
        for (Reservation reservation : reservations.values()) {
            if (!reservation.getTableId().equals(tableId)) {
                continue;
            }
            if (reservation.getStatus() == ReservationStatus.CANCELLED || reservation.getStatus() == ReservationStatus.COMPLETED) {
                continue;
            }
            boolean overlaps = start.isBefore(reservation.getEndTime()) && end.isAfter(reservation.getStartTime());
            if (overlaps) {
                throw new IllegalStateException("Reservation time overlaps with an existing booking");
            }
        }
    }
}
