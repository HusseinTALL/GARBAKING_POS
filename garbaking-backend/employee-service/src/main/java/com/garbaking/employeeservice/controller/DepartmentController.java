package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.DepartmentDTO;
import com.garbaking.employeeservice.model.Department;
import com.garbaking.employeeservice.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for Department operations
 */
@RestController
@RequestMapping("/api/employees/departments")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        log.info("GET /api/employees/departments - activeOnly: {}", activeOnly);
        List<Department> departments = activeOnly
                ? departmentRepository.findByIsActiveTrue()
                : departmentRepository.findAll();

        List<DepartmentDTO> dtos = departments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDTO> getDepartmentById(@PathVariable Long id) {
        log.info("GET /api/employees/departments/{}", id);
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        return ResponseEntity.ok(convertToDTO(department));
    }

    private DepartmentDTO convertToDTO(Department department) {
        return DepartmentDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .isActive(department.getIsActive())
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();
    }
}
