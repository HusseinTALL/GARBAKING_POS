package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.AvailabilityWindowDTO;
import com.garbaking.employeeservice.dto.SetAvailabilityRequest;
import com.garbaking.employeeservice.model.AvailabilityWindow;
import com.garbaking.employeeservice.model.Employee;
import com.garbaking.employeeservice.repository.AvailabilityWindowRepository;
import com.garbaking.employeeservice.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for Employee Availability operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityWindowRepository availabilityWindowRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public AvailabilityWindowDTO setAvailability(SetAvailabilityRequest request) {
        log.info("Setting availability for employee {} on {}", request.getEmployeeId(), request.getDayOfWeek());

        // Validate employee exists
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + request.getEmployeeId()));

        // Validate time range if provided
        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (!request.getStartTime().isBefore(request.getEndTime())) {
                throw new RuntimeException("Start time must be before end time");
            }
        }

        // Check if availability already exists for this day
        Optional<AvailabilityWindow> existingOpt = availabilityWindowRepository
                .findByEmployeeIdAndDayOfWeek(request.getEmployeeId(), request.getDayOfWeek());

        AvailabilityWindow availability;

        if (existingOpt.isPresent()) {
            // Update existing
            availability = existingOpt.get();
            availability.setIsAvailable(request.getIsAvailable());
            availability.setStartTime(request.getStartTime());
            availability.setEndTime(request.getEndTime());
            availability.setNotes(request.getNotes());
            log.info("Updating existing availability window: {}", availability.getId());
        } else {
            // Create new
            availability = AvailabilityWindow.builder()
                    .employee(employee)
                    .dayOfWeek(request.getDayOfWeek())
                    .isAvailable(request.getIsAvailable())
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .notes(request.getNotes())
                    .isActive(true)
                    .build();
            log.info("Creating new availability window");
        }

        AvailabilityWindow savedAvailability = availabilityWindowRepository.save(availability);
        log.info("Availability set successfully");

        return convertToDTO(savedAvailability);
    }

    @Transactional
    public void deleteAvailability(Long availabilityId) {
        log.info("Deleting availability with ID: {}", availabilityId);

        AvailabilityWindow availability = availabilityWindowRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability window not found with ID: " + availabilityId));

        availabilityWindowRepository.delete(availability);
        log.info("Availability deleted successfully: {}", availabilityId);
    }

    @Transactional
    public void clearEmployeeAvailability(Long employeeId) {
        log.info("Clearing all availability for employee: {}", employeeId);

        availabilityWindowRepository.deleteByEmployeeId(employeeId);
        log.info("All availability cleared for employee: {}", employeeId);
    }

    @Transactional(readOnly = true)
    public AvailabilityWindowDTO getAvailabilityById(Long availabilityId) {
        log.info("Getting availability by ID: {}", availabilityId);

        AvailabilityWindow availability = availabilityWindowRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability window not found with ID: " + availabilityId));

        return convertToDTO(availability);
    }

    @Transactional(readOnly = true)
    public List<AvailabilityWindowDTO> getEmployeeAvailability(Long employeeId) {
        log.info("Getting availability for employee: {}", employeeId);

        List<AvailabilityWindow> availability = availabilityWindowRepository
                .findByEmployeeIdAndIsActiveTrue(employeeId);

        return availability.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AvailabilityWindowDTO getEmployeeAvailabilityForDay(Long employeeId, DayOfWeek dayOfWeek) {
        log.info("Getting availability for employee {} on {}", employeeId, dayOfWeek);

        Optional<AvailabilityWindow> availability = availabilityWindowRepository
                .findByEmployeeIdAndDayOfWeek(employeeId, dayOfWeek);

        return availability.map(this::convertToDTO).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<AvailabilityWindowDTO> getAvailableEmployeesForDay(DayOfWeek dayOfWeek) {
        log.info("Getting available employees for day: {}", dayOfWeek);

        List<AvailabilityWindow> availability = availabilityWindowRepository
                .findAvailableEmployeesByDay(dayOfWeek);

        return availability.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isEmployeeAvailableOnDay(Long employeeId, DayOfWeek dayOfWeek) {
        log.info("Checking if employee {} is available on {}", employeeId, dayOfWeek);

        return availabilityWindowRepository.isEmployeeAvailableOnDay(employeeId, dayOfWeek);
    }

    @Transactional(readOnly = true)
    public List<AvailabilityWindowDTO> getUnavailableDays(Long employeeId) {
        log.info("Getting unavailable days for employee: {}", employeeId);

        List<AvailabilityWindow> unavailableDays = availabilityWindowRepository
                .findUnavailableDaysByEmployee(employeeId);

        return unavailableDays.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AvailabilityWindowDTO convertToDTO(AvailabilityWindow availability) {
        return AvailabilityWindowDTO.builder()
                .id(availability.getId())
                .employeeId(availability.getEmployee().getId())
                .employeeName(availability.getEmployee().getFullName())
                .employeeNumber(availability.getEmployee().getEmployeeNumber())
                .dayOfWeek(availability.getDayOfWeek())
                .isAvailable(availability.getIsAvailable())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .notes(availability.getNotes())
                .isActive(availability.getIsActive())
                .createdAt(availability.getCreatedAt())
                .updatedAt(availability.getUpdatedAt())
                .build();
    }
}
