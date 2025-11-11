package com.garbaking.employeeservice.bootstrap;

import com.garbaking.employeeservice.model.Department;
import com.garbaking.employeeservice.model.PayType;
import com.garbaking.employeeservice.model.Position;
import com.garbaking.employeeservice.repository.DepartmentRepository;
import com.garbaking.employeeservice.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Bootstrap data loader for Employee Service
 * Loads default departments and positions
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class EmployeeDataLoader implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;

    @Override
    public void run(String... args) {
        log.info("Starting Employee Service data bootstrap...");

        // Load departments
        if (departmentRepository.count() == 0) {
            loadDepartments();
        }

        // Load positions
        if (positionRepository.count() == 0) {
            loadPositions();
        }

        log.info("Employee Service data bootstrap completed!");
    }

    private void loadDepartments() {
        log.info("Loading default departments...");

        List<Department> departments = List.of(
                Department.builder()
                        .name("Management")
                        .description("Restaurant management and administration")
                        .isActive(true)
                        .build(),
                Department.builder()
                        .name("Front of House")
                        .description("Customer-facing staff including servers and hosts")
                        .isActive(true)
                        .build(),
                Department.builder()
                        .name("Kitchen")
                        .description("Kitchen and food preparation staff")
                        .isActive(true)
                        .build(),
                Department.builder()
                        .name("Bar")
                        .description("Bar and beverage service")
                        .isActive(true)
                        .build(),
                Department.builder()
                        .name("Maintenance")
                        .description("Facility maintenance and cleaning")
                        .isActive(true)
                        .build()
        );

        departmentRepository.saveAll(departments);
        log.info("Loaded {} departments", departments.size());
    }

    private void loadPositions() {
        log.info("Loading default positions...");

        // Get departments
        Department management = departmentRepository.findByName("Management")
                .orElseThrow(() -> new RuntimeException("Management department not found"));
        Department frontOfHouse = departmentRepository.findByName("Front of House")
                .orElseThrow(() -> new RuntimeException("Front of House department not found"));
        Department kitchen = departmentRepository.findByName("Kitchen")
                .orElseThrow(() -> new RuntimeException("Kitchen department not found"));
        Department bar = departmentRepository.findByName("Bar")
                .orElseThrow(() -> new RuntimeException("Bar department not found"));
        Department maintenance = departmentRepository.findByName("Maintenance")
                .orElseThrow(() -> new RuntimeException("Maintenance department not found"));

        List<Position> positions = List.of(
                // Management positions
                Position.builder()
                        .title("General Manager")
                        .description("Overall restaurant operations manager")
                        .department(management)
                        .payType(PayType.SALARY)
                        .basePayRate(new BigDecimal("60000"))
                        .minPayRate(new BigDecimal("50000"))
                        .maxPayRate(new BigDecimal("80000"))
                        .isActive(true)
                        .requiresCertification(false)
                        .build(),
                Position.builder()
                        .title("Assistant Manager")
                        .description("Assists general manager with daily operations")
                        .department(management)
                        .payType(PayType.SALARY)
                        .basePayRate(new BigDecimal("45000"))
                        .minPayRate(new BigDecimal("35000"))
                        .maxPayRate(new BigDecimal("55000"))
                        .isActive(true)
                        .requiresCertification(false)
                        .build(),

                // Front of House positions
                Position.builder()
                        .title("Server")
                        .description("Takes orders and serves food to customers")
                        .department(frontOfHouse)
                        .payType(PayType.HOURLY)
                        .basePayRate(new BigDecimal("15.00"))
                        .minPayRate(new BigDecimal("12.00"))
                        .maxPayRate(new BigDecimal("20.00"))
                        .isActive(true)
                        .requiresCertification(false)
                        .build(),
                Position.builder()
                        .title("Host/Hostess")
                        .description("Greets and seats customers")
                        .department(frontOfHouse)
                        .payType(PayType.HOURLY)
                        .basePayRate(new BigDecimal("14.00"))
                        .minPayRate(new BigDecimal("12.00"))
                        .maxPayRate(new BigDecimal("16.00"))
                        .isActive(true)
                        .requiresCertification(false)
                        .build(),
                Position.builder()
                        .title("Cashier")
                        .description("Handles payments and transactions")
                        .department(frontOfHouse)
                        .payType(PayType.HOURLY)
                        .basePayRate(new BigDecimal("14.00"))
                        .minPayRate(new BigDecimal("12.00"))
                        .maxPayRate(new BigDecimal("17.00"))
                        .isActive(true)
                        .requiresCertification(false)
                        .build(),

                // Kitchen positions
                Position.builder()
                        .title("Head Chef")
                        .description("Manages kitchen operations and menu")
                        .department(kitchen)
                        .payType(PayType.SALARY)
                        .basePayRate(new BigDecimal("50000"))
                        .minPayRate(new BigDecimal("40000"))
                        .maxPayRate(new BigDecimal("70000"))
                        .isActive(true)
                        .requiresCertification(true)
                        .build(),
                Position.builder()
                        .title("Sous Chef")
                        .description("Assists head chef and supervises kitchen staff")
                        .department(kitchen)
                        .payType(PayType.SALARY)
                        .basePayRate(new BigDecimal("40000"))
                        .minPayRate(new BigDecimal("32000"))
                        .maxPayRate(new BigDecimal("55000"))
                        .isActive(true)
                        .requiresCertification(true)
                        .build(),
                Position.builder()
                        .title("Line Cook")
                        .description("Prepares food items on the cooking line")
                        .department(kitchen)
                        .payType(PayType.HOURLY)
                        .basePayRate(new BigDecimal("16.00"))
                        .minPayRate(new BigDecimal("14.00"))
                        .maxPayRate(new BigDecimal("22.00"))
                        .isActive(true)
                        .requiresCertification(false)
                        .build(),
                Position.builder()
                        .title("Prep Cook")
                        .description("Prepares ingredients and assists with food preparation")
                        .department(kitchen)
                        .payType(PayType.HOURLY)
                        .basePayRate(new BigDecimal("14.00"))
                        .minPayRate(new BigDecimal("12.00"))
                        .maxPayRate(new BigDecimal("18.00"))
                        .isActive(true)
                        .requiresCertification(false)
                        .build(),
                Position.builder()
                        .title("Dishwasher")
                        .description("Maintains cleanliness of dishes and kitchen equipment")
                        .department(kitchen)
                        .payType(PayType.HOURLY)
                        .basePayRate(new BigDecimal("13.00"))
                        .minPayRate(new BigDecimal("11.00"))
                        .maxPayRate(new BigDecimal("15.00"))
                        .isActive(true)
                        .requiresCertification(false)
                        .build(),

                // Bar positions
                Position.builder()
                        .title("Bartender")
                        .description("Prepares and serves alcoholic beverages")
                        .department(bar)
                        .payType(PayType.HOURLY)
                        .basePayRate(new BigDecimal("16.00"))
                        .minPayRate(new BigDecimal("14.00"))
                        .maxPayRate(new BigDecimal("22.00"))
                        .isActive(true)
                        .requiresCertification(true)
                        .build(),
                Position.builder()
                        .title("Barback")
                        .description("Assists bartender with setup and cleaning")
                        .department(bar)
                        .payType(PayType.HOURLY)
                        .basePayRate(new BigDecimal("14.00"))
                        .minPayRate(new BigDecimal("12.00"))
                        .maxPayRate(new BigDecimal("17.00"))
                        .isActive(true)
                        .requiresCertification(false)
                        .build(),

                // Maintenance positions
                Position.builder()
                        .title("Janitor")
                        .description("Maintains cleanliness of restaurant facility")
                        .department(maintenance)
                        .payType(PayType.HOURLY)
                        .basePayRate(new BigDecimal("13.00"))
                        .minPayRate(new BigDecimal("11.00"))
                        .maxPayRate(new BigDecimal("16.00"))
                        .isActive(true)
                        .requiresCertification(false)
                        .build()
        );

        positionRepository.saveAll(positions);
        log.info("Loaded {} positions", positions.size());
    }
}
