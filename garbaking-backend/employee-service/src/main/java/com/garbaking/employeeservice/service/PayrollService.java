package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.PayrollEntryDTO;
import com.garbaking.employeeservice.dto.PayrollPeriodDTO;
import com.garbaking.employeeservice.model.*;
import com.garbaking.employeeservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Payroll operations with automatic calculation from time entries
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollPeriodRepository periodRepository;
    private final PayrollEntryRepository entryRepository;
    private final EmployeeRepository employeeRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final BonusRepository bonusRepository;
    private final DeductionRepository deductionRepository;

    @Transactional
    public PayrollPeriodDTO createPayrollPeriod(LocalDate startDate, LocalDate endDate, LocalDate payDate) {
        log.info("Creating payroll period from {} to {}", startDate, endDate);

        // Validate dates
        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("Start date must be before end date");
        }

        String periodName = formatPeriodName(startDate, endDate);

        PayrollPeriod period = PayrollPeriod.builder()
                .periodName(periodName)
                .startDate(startDate)
                .endDate(endDate)
                .payDate(payDate)
                .status(PayrollStatus.DRAFT)
                .build();

        PayrollPeriod savedPeriod = periodRepository.save(period);
        log.info("Payroll period created: {}", savedPeriod.getId());

        return convertPeriodToDTO(savedPeriod);
    }

    @Transactional
    public List<PayrollEntryDTO> generatePayrollEntries(Long periodId) {
        log.info("Generating payroll entries for period: {}", periodId);

        PayrollPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new RuntimeException("Payroll period not found: " + periodId));

        if (period.getStatus() != PayrollStatus.DRAFT) {
            throw new RuntimeException("Can only generate entries for DRAFT payroll periods");
        }

        // Get all active employees
        List<Employee> employees = employeeRepository.findByStatus(EmployeeStatus.ACTIVE);

        List<PayrollEntry> entries = employees.stream()
                .map(employee -> generateEntryForEmployee(period, employee))
                .collect(Collectors.toList());

        List<PayrollEntry> savedEntries = entryRepository.saveAll(entries);

        // Update period totals
        updatePeriodTotals(period);

        // Mark period as PROCESSING
        period.setStatus(PayrollStatus.PROCESSING);
        periodRepository.save(period);

        log.info("Generated {} payroll entries", savedEntries.size());
        return savedEntries.stream().map(this::convertEntryToDTO).collect(Collectors.toList());
    }

    private PayrollEntry generateEntryForEmployee(PayrollPeriod period, Employee employee) {
        // Get all approved time entries for the period
        List<TimeEntry> timeEntries = timeEntryRepository.findApprovedByEmployeeAndDateRange(
                employee.getId(),
                period.getStartDate(),
                period.getEndDate()
        );

        // Calculate total hours and overtime
        BigDecimal regularHours = BigDecimal.ZERO;
        BigDecimal overtimeHours = BigDecimal.ZERO;
        BigDecimal tips = BigDecimal.ZERO;

        for (TimeEntry entry : timeEntries) {
            if (entry.getTotalHours() != null) {
                // Add regular hours (max 8 per day)
                BigDecimal dailyRegular = entry.getTotalHours().min(BigDecimal.valueOf(8));
                regularHours = regularHours.add(dailyRegular);

                // Add overtime hours (anything over 8 per day)
                if (entry.getTotalHours().compareTo(BigDecimal.valueOf(8)) > 0) {
                    BigDecimal dailyOvertime = entry.getTotalHours().subtract(BigDecimal.valueOf(8));
                    overtimeHours = overtimeHours.add(dailyOvertime);
                }
            }

            // Add tips
            if (entry.getTips() != null) {
                tips = tips.add(entry.getTips());
            }
        }

        // Get pay rate from employee
        BigDecimal regularRate = employee.getPayRate() != null ? employee.getPayRate() : BigDecimal.ZERO;

        // Create payroll entry
        PayrollEntry entry = PayrollEntry.builder()
                .payrollPeriod(period)
                .employee(employee)
                .regularHours(regularHours)
                .overtimeHours(overtimeHours)
                .regularRate(regularRate)
                .tips(tips)
                .daysWorked(timeEntries.size())
                .build();

        // Calculate overtime rate (1.5x)
        entry.calculateOvertimeRate();

        // Calculate total hours
        entry.calculateTotalHours();

        // Calculate gross pay
        entry.calculateGrossPay();

        // Get unpaid bonuses for this employee
        BigDecimal bonusAmount = bonusRepository.calculateTotalUnpaidByEmployee(employee.getId());
        entry.setBonuses(bonusAmount);

        // Recalculate gross pay with bonuses
        entry.calculateGrossPay();

        // Get recurring deductions
        BigDecimal deductionAmount = deductionRepository.calculateTotalRecurringByEmployee(employee.getId());
        entry.setTotalDeductions(deductionAmount);

        // Calculate net pay
        entry.calculateNetPay();

        return entry;
    }

    private void updatePeriodTotals(PayrollPeriod period) {
        BigDecimal grossPay = entryRepository.calculateTotalGrossPay(period.getId());
        BigDecimal deductions = entryRepository.calculateTotalDeductions(period.getId());
        BigDecimal netPay = entryRepository.calculateTotalNetPay(period.getId());
        BigDecimal hours = entryRepository.calculateTotalHours(period.getId());
        BigDecimal overtimeHours = entryRepository.calculateTotalOvertimeHours(period.getId());
        Integer count = entryRepository.countEmployeesInPeriod(period.getId());

        period.calculateTotals(grossPay, deductions, netPay, hours, overtimeHours, count);
        periodRepository.save(period);
    }

    @Transactional
    public PayrollPeriodDTO approvePayrollPeriod(Long periodId, Long managerId) {
        log.info("Approving payroll period {} by manager {}", periodId, managerId);

        PayrollPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new RuntimeException("Payroll period not found: " + periodId));

        period.approve(managerId);
        PayrollPeriod savedPeriod = periodRepository.save(period);

        return convertPeriodToDTO(savedPeriod);
    }

    @Transactional
    public PayrollPeriodDTO markPayrollPaid(Long periodId) {
        log.info("Marking payroll period as paid: {}", periodId);

        PayrollPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new RuntimeException("Payroll period not found: " + periodId));

        period.markPaid();

        // Mark bonuses as paid
        List<PayrollEntry> entries = entryRepository.findByPayrollPeriodId(periodId);
        for (PayrollEntry entry : entries) {
            List<Bonus> unpaidBonuses = bonusRepository.findUnpaidBonusesByEmployee(entry.getEmployee().getId());
            unpaidBonuses.forEach(bonus -> {
                bonus.markPaid();
                bonusRepository.save(bonus);
            });
        }

        PayrollPeriod savedPeriod = periodRepository.save(period);
        return convertPeriodToDTO(savedPeriod);
    }

    @Transactional(readOnly = true)
    public PayrollPeriodDTO getPayrollPeriodById(Long periodId) {
        PayrollPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new RuntimeException("Payroll period not found: " + periodId));

        return convertPeriodToDTO(period);
    }

    @Transactional(readOnly = true)
    public List<PayrollPeriodDTO> getAllPayrollPeriods() {
        List<PayrollPeriod> periods = periodRepository.findAllOrderByStartDateDesc();
        return periods.stream().map(this::convertPeriodToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PayrollEntryDTO> getPayrollEntriesForPeriod(Long periodId) {
        List<PayrollEntry> entries = entryRepository.findByPayrollPeriodId(periodId);
        return entries.stream().map(this::convertEntryToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PayrollEntryDTO> getPayrollHistoryForEmployee(Long employeeId) {
        List<PayrollEntry> entries = entryRepository.findByEmployeeId(employeeId);
        return entries.stream().map(this::convertEntryToDTO).collect(Collectors.toList());
    }

    private String formatPeriodName(LocalDate startDate, LocalDate endDate) {
        return String.format("%s %d-%d, %d",
                startDate.getMonth().toString().substring(0, 3),
                startDate.getDayOfMonth(),
                endDate.getDayOfMonth(),
                startDate.getYear()
        );
    }

    private PayrollPeriodDTO convertPeriodToDTO(PayrollPeriod period) {
        PayrollPeriodDTO dto = PayrollPeriodDTO.builder()
                .id(period.getId())
                .periodName(period.getPeriodName())
                .startDate(period.getStartDate())
                .endDate(period.getEndDate())
                .payDate(period.getPayDate())
                .status(period.getStatus())
                .totalGrossPay(period.getTotalGrossPay())
                .totalDeductions(period.getTotalDeductions())
                .totalNetPay(period.getTotalNetPay())
                .totalHours(period.getTotalHours())
                .totalOvertimeHours(period.getTotalOvertimeHours())
                .employeeCount(period.getEmployeeCount())
                .approvedBy(period.getApprovedBy())
                .approvedAt(period.getApprovedAt())
                .paidAt(period.getPaidAt())
                .notes(period.getNotes())
                .createdAt(period.getCreatedAt())
                .updatedAt(period.getUpdatedAt())
                .build();

        if (period.getApprovedBy() != null) {
            employeeRepository.findById(period.getApprovedBy())
                    .ifPresent(approver -> dto.setApproverName(approver.getFullName()));
        }

        return dto;
    }

    private PayrollEntryDTO convertEntryToDTO(PayrollEntry entry) {
        return PayrollEntryDTO.builder()
                .id(entry.getId())
                .payrollPeriodId(entry.getPayrollPeriod().getId())
                .periodName(entry.getPayrollPeriod().getPeriodName())
                .employeeId(entry.getEmployee().getId())
                .employeeName(entry.getEmployee().getFullName())
                .employeeNumber(entry.getEmployee().getEmployeeNumber())
                .positionTitle(entry.getEmployee().getPosition() != null ? entry.getEmployee().getPosition().getTitle() : null)
                .regularHours(entry.getRegularHours())
                .overtimeHours(entry.getOvertimeHours())
                .totalHours(entry.getTotalHours())
                .regularRate(entry.getRegularRate())
                .overtimeRate(entry.getOvertimeRate())
                .regularPay(entry.getRegularPay())
                .overtimePay(entry.getOvertimePay())
                .tips(entry.getTips())
                .bonuses(entry.getBonuses())
                .grossPay(entry.getGrossPay())
                .totalDeductions(entry.getTotalDeductions())
                .netPay(entry.getNetPay())
                .daysWorked(entry.getDaysWorked())
                .attendanceIssues(entry.getAttendanceIssues())
                .notes(entry.getNotes())
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }
}
