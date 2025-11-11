package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.CreateEmployeeRequest;
import com.garbaking.employeeservice.dto.EmployeeDTO;
import com.garbaking.employeeservice.dto.EmployeeSummaryDTO;
import com.garbaking.employeeservice.dto.UpdateEmployeeRequest;
import com.garbaking.employeeservice.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Employee operations
 */
@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        log.info("GET /api/employees - activeOnly: {}", activeOnly);
        List<EmployeeDTO> employees = activeOnly
                ? employeeService.getActiveEmployees()
                : employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/search")
    public ResponseEntity<List<EmployeeSummaryDTO>> searchEmployees(
            @RequestParam String q
    ) {
        log.info("GET /api/employees/search - query: {}", q);
        List<EmployeeSummaryDTO> employees = employeeService.searchEmployees(q);
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable Long id) {
        log.info("GET /api/employees/{}", id);
        EmployeeDTO employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(employee);
    }

    @GetMapping("/number/{employeeNumber}")
    public ResponseEntity<EmployeeDTO> getEmployeeByNumber(@PathVariable String employeeNumber) {
        log.info("GET /api/employees/number/{}", employeeNumber);
        EmployeeDTO employee = employeeService.getEmployeeByEmployeeNumber(employeeNumber);
        return ResponseEntity.ok(employee);
    }

    @PostMapping
    public ResponseEntity<EmployeeDTO> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        log.info("POST /api/employees - Creating employee: {} {}", request.getFirstName(), request.getLastName());
        EmployeeDTO employee = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDTO> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEmployeeRequest request
    ) {
        log.info("PUT /api/employees/{}", id);
        EmployeeDTO employee = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(employee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        log.info("DELETE /api/employees/{}", id);
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countActiveEmployees() {
        log.info("GET /api/employees/count");
        long count = employeeService.countActiveEmployees();
        return ResponseEntity.ok(count);
    }
}
