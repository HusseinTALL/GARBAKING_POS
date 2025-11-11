package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.*;
import com.garbaking.employeeservice.model.*;
import com.garbaking.employeeservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Shift operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftRepository shiftRepository;
    private final EmployeeRepository employeeRepository;
    private final PositionRepository positionRepository;
    private final AvailabilityWindowRepository availabilityWindowRepository;

    @Transactional
    public ShiftDTO createShift(CreateShiftRequest request) {
        log.info("Creating shift for employee {} on {}", request.getEmployeeId(), request.getShiftDate());

        // Validate employee exists
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + request.getEmployeeId()));

        // Validate position exists
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new RuntimeException("Position not found with ID: " + request.getPositionId()));

        // Validate shift date is not in the past
        if (request.getShiftDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot create shift in the past");
        }

        // Validate start time is before end time
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        // Check for conflicting shifts
        List<Shift> conflicts = shiftRepository.findConflictingShifts(
                request.getEmployeeId(),
                request.getShiftDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Employee already has a conflicting shift on this date");
        }

        // Check employee availability
        if (!isEmployeeAvailable(employee.getId(), request.getShiftDate(), request.getStartTime(), request.getEndTime())) {
            log.warn("Employee {} is not available for the requested shift time", employee.getFullName());
            // Note: This is a warning, not blocking the shift creation
        }

        // Create shift
        Shift shift = Shift.builder()
                .employee(employee)
                .position(position)
                .shiftDate(request.getShiftDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .breakMinutes(request.getBreakMinutes() != null ? request.getBreakMinutes() : 30)
                .status(ShiftStatus.SCHEDULED)
                .location(request.getLocation())
                .notes(request.getNotes())
                .managerNotes(request.getManagerNotes())
                .build();

        Shift savedShift = shiftRepository.save(shift);
        log.info("Shift created successfully with ID: {}", savedShift.getId());

        return convertToDTO(savedShift);
    }

    @Transactional
    public ShiftDTO updateShift(Long shiftId, UpdateShiftRequest request) {
        log.info("Updating shift with ID: {}", shiftId);

        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found with ID: " + shiftId));

        // Update employee if provided
        if (request.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + request.getEmployeeId()));
            shift.setEmployee(employee);
        }

        // Update position if provided
        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found with ID: " + request.getPositionId()));
            shift.setPosition(position);
        }

        // Update shift details
        if (request.getShiftDate() != null) {
            shift.setShiftDate(request.getShiftDate());
        }
        if (request.getStartTime() != null) {
            shift.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            shift.setEndTime(request.getEndTime());
        }
        if (request.getBreakMinutes() != null) {
            shift.setBreakMinutes(request.getBreakMinutes());
        }
        if (request.getStatus() != null) {
            shift.setStatus(request.getStatus());
        }
        if (request.getLocation() != null) {
            shift.setLocation(request.getLocation());
        }
        if (request.getNotes() != null) {
            shift.setNotes(request.getNotes());
        }
        if (request.getManagerNotes() != null) {
            shift.setManagerNotes(request.getManagerNotes());
        }

        // Validate no conflicts after update
        if (shift.getEmployee() != null && shift.getShiftDate() != null &&
                shift.getStartTime() != null && shift.getEndTime() != null) {
            List<Shift> conflicts = shiftRepository.findConflictingShifts(
                    shift.getEmployee().getId(),
                    shift.getShiftDate(),
                    shift.getStartTime(),
                    shift.getEndTime()
            );
            // Remove self from conflicts
            conflicts = conflicts.stream()
                    .filter(s -> !s.getId().equals(shiftId))
                    .collect(Collectors.toList());

            if (!conflicts.isEmpty()) {
                throw new RuntimeException("Update would create a conflicting shift");
            }
        }

        Shift updatedShift = shiftRepository.save(shift);
        log.info("Shift updated successfully: {}", shiftId);

        return convertToDTO(updatedShift);
    }

    @Transactional
    public void deleteShift(Long shiftId) {
        log.info("Deleting shift with ID: {}", shiftId);

        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found with ID: " + shiftId));

        // Can only delete scheduled shifts
        if (shift.getStatus() != ShiftStatus.SCHEDULED) {
            throw new RuntimeException("Can only delete scheduled shifts. Current status: " + shift.getStatus());
        }

        shiftRepository.delete(shift);
        log.info("Shift deleted successfully: {}", shiftId);
    }

    @Transactional
    public ShiftDTO markShiftCompleted(Long shiftId) {
        log.info("Marking shift as completed: {}", shiftId);

        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found with ID: " + shiftId));

        shift.markCompleted();
        Shift updatedShift = shiftRepository.save(shift);

        return convertToDTO(updatedShift);
    }

    @Transactional
    public ShiftDTO markShiftNoShow(Long shiftId) {
        log.info("Marking shift as no-show: {}", shiftId);

        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found with ID: " + shiftId));

        shift.markNoShow();
        Shift updatedShift = shiftRepository.save(shift);

        return convertToDTO(updatedShift);
    }

    @Transactional
    public ShiftDTO cancelShift(Long shiftId) {
        log.info("Cancelling shift: {}", shiftId);

        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found with ID: " + shiftId));

        shift.cancel();
        Shift updatedShift = shiftRepository.save(shift);

        return convertToDTO(updatedShift);
    }

    @Transactional(readOnly = true)
    public ShiftDTO getShiftById(Long shiftId) {
        log.info("Getting shift by ID: {}", shiftId);

        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found with ID: " + shiftId));

        return convertToDTO(shift);
    }

    @Transactional(readOnly = true)
    public List<ShiftDTO> getShiftsByEmployee(Long employeeId, LocalDate startDate, LocalDate endDate) {
        log.info("Getting shifts for employee {} from {} to {}", employeeId, startDate, endDate);

        List<Shift> shifts = shiftRepository.findByEmployeeIdAndDateRange(employeeId, startDate, endDate);
        return shifts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftDTO> getShiftsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Getting all shifts from {} to {}", startDate, endDate);

        List<Shift> shifts = shiftRepository.findByDateRange(startDate, endDate);
        return shifts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftDTO> getTodaysShifts() {
        log.info("Getting today's shifts");

        LocalDate today = LocalDate.now();
        List<Shift> shifts = shiftRepository.findTodaysShifts(today);
        return shifts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftDTO> getUpcomingShiftsByEmployee(Long employeeId) {
        log.info("Getting upcoming shifts for employee: {}", employeeId);

        LocalDate today = LocalDate.now();
        List<Shift> shifts = shiftRepository.findUpcomingShiftsByEmployee(employeeId, today);
        return shifts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftDTO> getUnassignedShifts() {
        log.info("Getting unassigned shifts");

        LocalDate today = LocalDate.now();
        List<Shift> shifts = shiftRepository.findUnassignedShifts(today);
        return shifts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScheduleDTO getSchedule(LocalDate startDate, LocalDate endDate) {
        log.info("Getting schedule from {} to {}", startDate, endDate);

        List<Shift> shifts = shiftRepository.findByDateRange(startDate, endDate);
        List<ShiftDTO> shiftDTOs = shifts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // Group by date
        Map<LocalDate, List<ShiftDTO>> shiftsByDate = shiftDTOs.stream()
                .collect(Collectors.groupingBy(ShiftDTO::getShiftDate));

        // Group by employee
        Map<Long, List<ShiftDTO>> shiftsByEmployee = shiftDTOs.stream()
                .filter(s -> s.getEmployeeId() != null)
                .collect(Collectors.groupingBy(ShiftDTO::getEmployeeId));

        // Calculate staffing by date
        Map<LocalDate, Integer> staffingByDate = shiftsByDate.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> (int) e.getValue().stream().filter(s -> s.getEmployeeId() != null).count()
                ));

        // Get unassigned shifts
        List<ShiftDTO> unassignedShifts = shiftDTOs.stream()
                .filter(s -> s.getEmployeeId() == null)
                .collect(Collectors.toList());

        // Calculate totals
        int totalShifts = shiftDTOs.size();
        int totalEmployees = (int) shiftDTOs.stream()
                .map(ShiftDTO::getEmployeeId)
                .filter(Objects::nonNull)
                .distinct()
                .count();
        double totalScheduledHours = shiftDTOs.stream()
                .mapToDouble(s -> s.getShiftHours() != null ? s.getShiftHours() : 0.0)
                .sum();

        return ScheduleDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .shifts(shiftDTOs)
                .shiftsByDate(shiftsByDate)
                .shiftsByEmployee(shiftsByEmployee)
                .totalShifts(totalShifts)
                .totalEmployees(totalEmployees)
                .totalScheduledHours(totalScheduledHours)
                .staffingByDate(staffingByDate)
                .unassignedShifts(unassignedShifts)
                .build();
    }

    private boolean isEmployeeAvailable(Long employeeId, LocalDate shiftDate,
                                       java.time.LocalTime startTime, java.time.LocalTime endTime) {
        java.time.DayOfWeek dayOfWeek = shiftDate.getDayOfWeek();

        Optional<AvailabilityWindow> availabilityOpt = availabilityWindowRepository
                .findByEmployeeIdAndDayOfWeek(employeeId, dayOfWeek);

        if (availabilityOpt.isEmpty()) {
            // No availability set, assume available
            return true;
        }

        AvailabilityWindow availability = availabilityOpt.get();
        return !availability.conflictsWith(startTime, endTime);
    }

    private ShiftDTO convertToDTO(Shift shift) {
        return ShiftDTO.builder()
                .id(shift.getId())
                .employeeId(shift.getEmployee() != null ? shift.getEmployee().getId() : null)
                .employeeName(shift.getEmployee() != null ? shift.getEmployee().getFullName() : null)
                .employeeNumber(shift.getEmployee() != null ? shift.getEmployee().getEmployeeNumber() : null)
                .positionId(shift.getPosition().getId())
                .positionTitle(shift.getPosition().getTitle())
                .shiftDate(shift.getShiftDate())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .breakMinutes(shift.getBreakMinutes())
                .status(shift.getStatus())
                .location(shift.getLocation())
                .notes(shift.getNotes())
                .managerNotes(shift.getManagerNotes())
                .shiftHours(shift.getShiftHours())
                .isToday(shift.isToday())
                .isUpcoming(shift.isUpcoming())
                .isPast(shift.isPast())
                .createdAt(shift.getCreatedAt())
                .updatedAt(shift.getUpdatedAt())
                .build();
    }
}
