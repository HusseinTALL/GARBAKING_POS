package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.CreateEmployeeRequest;
import com.garbaking.employeeservice.dto.EmployeeDTO;
import com.garbaking.employeeservice.dto.EmployeeSummaryDTO;
import com.garbaking.employeeservice.dto.UpdateEmployeeRequest;
import com.garbaking.employeeservice.model.Employee;
import com.garbaking.employeeservice.model.EmployeeStatus;
import com.garbaking.employeeservice.model.Position;
import com.garbaking.employeeservice.repository.EmployeeRepository;
import com.garbaking.employeeservice.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Employee operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PositionRepository positionRepository;

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getActiveEmployees() {
        return employeeRepository.findAllActive().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeSummaryDTO> searchEmployees(String searchTerm) {
        return employeeRepository.searchEmployees(searchTerm).stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        return convertToDTO(employee);
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeByEmployeeNumber(String employeeNumber) {
        Employee employee = employeeRepository.findByEmployeeNumber(employeeNumber)
                .orElseThrow(() -> new RuntimeException("Employee not found with employee number: " + employeeNumber));
        return convertToDTO(employee);
    }

    @Transactional
    public EmployeeDTO createEmployee(CreateEmployeeRequest request) {
        log.info("Creating employee: {} {}", request.getFirstName(), request.getLastName());

        // Check if employee number exists
        String employeeNumber = generateEmployeeNumber();
        while (employeeRepository.existsByEmployeeNumber(employeeNumber)) {
            employeeNumber = generateEmployeeNumber();
        }

        // Check if email exists
        if (request.getEmail() != null && employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        // Get position
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new RuntimeException("Position not found with id: " + request.getPositionId()));

        // Build employee
        Employee employee = Employee.builder()
                .employeeNumber(employeeNumber)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .position(position)
                .department(position.getDepartment())
                .hireDate(request.getHireDate())
                .status(request.getStatus())
                .payType(request.getPayType())
                .payRate(request.getPayRate())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .emergencyContactRelationship(request.getEmergencyContactRelationship())
                .userId(request.getUserId())
                .notes(request.getNotes())
                .build();

        employee = employeeRepository.save(employee);
        log.info("Employee created with ID: {}", employee.getId());

        return convertToDTO(employee);
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, UpdateEmployeeRequest request) {
        log.info("Updating employee with id: {}", id);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        // Check email uniqueness if changed
        if (request.getEmail() != null && !request.getEmail().equals(employee.getEmail())) {
            if (employeeRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists: " + request.getEmail());
            }
            employee.setEmail(request.getEmail());
        }

        // Update fields
        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getPhone() != null) employee.setPhone(request.getPhone());
        if (request.getDateOfBirth() != null) employee.setDateOfBirth(request.getDateOfBirth());
        if (request.getAddress() != null) employee.setAddress(request.getAddress());
        if (request.getCity() != null) employee.setCity(request.getCity());
        if (request.getState() != null) employee.setState(request.getState());
        if (request.getPostalCode() != null) employee.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) employee.setCountry(request.getCountry());

        // Update position and department
        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found with id: " + request.getPositionId()));
            employee.setPosition(position);
            employee.setDepartment(position.getDepartment());
        }

        if (request.getTerminationDate() != null) employee.setTerminationDate(request.getTerminationDate());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());
        if (request.getPayType() != null) employee.setPayType(request.getPayType());
        if (request.getPayRate() != null) employee.setPayRate(request.getPayRate());

        // Update emergency contact
        if (request.getEmergencyContactName() != null) employee.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) employee.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getEmergencyContactRelationship() != null) employee.setEmergencyContactRelationship(request.getEmergencyContactRelationship());

        if (request.getProfilePictureUrl() != null) employee.setProfilePictureUrl(request.getProfilePictureUrl());
        if (request.getNotes() != null) employee.setNotes(request.getNotes());

        employee = employeeRepository.save(employee);
        log.info("Employee updated with ID: {}", employee.getId());

        return convertToDTO(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        log.info("Deleting employee with id: {}", id);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        // Soft delete - mark as terminated
        employee.setStatus(EmployeeStatus.TERMINATED);
        employee.setTerminationDate(LocalDate.now());
        employeeRepository.save(employee);

        log.info("Employee terminated with ID: {}", employee.getId());
    }

    @Transactional(readOnly = true)
    public long countActiveEmployees() {
        return employeeRepository.countActiveEmployees();
    }

    // Helper methods
    private String generateEmployeeNumber() {
        // Generate employee number: EMP-YYYY-NNNN
        int year = LocalDate.now().getYear();
        long count = employeeRepository.count() + 1;
        return String.format("EMP-%d-%04d", year, count);
    }

    private EmployeeDTO convertToDTO(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .employeeNumber(employee.getEmployeeNumber())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .dateOfBirth(employee.getDateOfBirth())
                .address(employee.getAddress())
                .city(employee.getCity())
                .state(employee.getState())
                .postalCode(employee.getPostalCode())
                .country(employee.getCountry())
                .positionId(employee.getPosition() != null ? employee.getPosition().getId() : null)
                .positionTitle(employee.getPosition() != null ? employee.getPosition().getTitle() : null)
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .hireDate(employee.getHireDate())
                .terminationDate(employee.getTerminationDate())
                .status(employee.getStatus())
                .yearsOfService(employee.getYearsOfService())
                .payType(employee.getPayType())
                .payRate(employee.getPayRate())
                .emergencyContactName(employee.getEmergencyContactName())
                .emergencyContactPhone(employee.getEmergencyContactPhone())
                .emergencyContactRelationship(employee.getEmergencyContactRelationship())
                .userId(employee.getUserId())
                .profilePictureUrl(employee.getProfilePictureUrl())
                .notes(employee.getNotes())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }

    private EmployeeSummaryDTO convertToSummaryDTO(Employee employee) {
        return EmployeeSummaryDTO.builder()
                .id(employee.getId())
                .employeeNumber(employee.getEmployeeNumber())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .positionTitle(employee.getPosition() != null ? employee.getPosition().getTitle() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .status(employee.getStatus())
                .hireDate(employee.getHireDate())
                .profilePictureUrl(employee.getProfilePictureUrl())
                .build();
    }
}
