package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.EmployeeCertificationDTO;
import com.garbaking.employeeservice.dto.EmployeeTrainingDTO;
import com.garbaking.employeeservice.service.TrainingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for Training and Certification operations
 */
@RestController
@RequestMapping("/api/employees/training")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;

    @PostMapping("/assign")
    public ResponseEntity<EmployeeTrainingDTO> assignTraining(
            @RequestParam Long employeeId,
            @RequestParam Long programId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate
    ) {
        log.info("POST /api/employees/training/assign - Employee: {}, Program: {}", employeeId, programId);
        EmployeeTrainingDTO training = trainingService.assignTraining(employeeId, programId, dueDate);
        return ResponseEntity.status(HttpStatus.CREATED).body(training);
    }

    @PostMapping("/{trainingId}/complete")
    public ResponseEntity<EmployeeTrainingDTO> completeTraining(
            @PathVariable Long trainingId,
            @RequestParam(required = false) Integer score,
            @RequestParam(required = false) String certificateUrl
    ) {
        log.info("POST /api/employees/training/{}/complete", trainingId);
        EmployeeTrainingDTO training = trainingService.completeTraining(trainingId, score, certificateUrl);
        return ResponseEntity.ok(training);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeTrainingDTO>> getTrainingForEmployee(
            @PathVariable Long employeeId
    ) {
        log.info("GET /api/employees/training/employee/{}", employeeId);
        List<EmployeeTrainingDTO> trainings = trainingService.getTrainingForEmployee(employeeId);
        return ResponseEntity.ok(trainings);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<EmployeeTrainingDTO>> getOverdueTraining() {
        log.info("GET /api/employees/training/overdue");
        List<EmployeeTrainingDTO> trainings = trainingService.getOverdueTraining();
        return ResponseEntity.ok(trainings);
    }

    @PostMapping("/certifications")
    public ResponseEntity<EmployeeCertificationDTO> addCertification(
            @RequestParam Long employeeId,
            @RequestParam Long certificationTypeId,
            @RequestParam String certificationNumber,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expirationDate
    ) {
        log.info("POST /api/employees/training/certifications - Employee: {}, Type: {}",
                employeeId, certificationTypeId);
        EmployeeCertificationDTO certification = trainingService.addCertification(
                employeeId, certificationTypeId, certificationNumber, issueDate, expirationDate
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(certification);
    }

    @PostMapping("/certifications/{certificationId}/verify")
    public ResponseEntity<EmployeeCertificationDTO> verifyCertification(
            @PathVariable Long certificationId,
            @RequestParam Long verifierId
    ) {
        log.info("POST /api/employees/training/certifications/{}/verify by {}", certificationId, verifierId);
        EmployeeCertificationDTO certification = trainingService.verifyCertification(certificationId, verifierId);
        return ResponseEntity.ok(certification);
    }

    @GetMapping("/certifications/employee/{employeeId}")
    public ResponseEntity<List<EmployeeCertificationDTO>> getCertificationsForEmployee(
            @PathVariable Long employeeId
    ) {
        log.info("GET /api/employees/training/certifications/employee/{}", employeeId);
        List<EmployeeCertificationDTO> certifications = trainingService.getCertificationsForEmployee(employeeId);
        return ResponseEntity.ok(certifications);
    }

    @GetMapping("/certifications/expiring-soon")
    public ResponseEntity<List<EmployeeCertificationDTO>> getExpiringSoonCertifications() {
        log.info("GET /api/employees/training/certifications/expiring-soon");
        List<EmployeeCertificationDTO> certifications = trainingService.getExpiringSoonCertifications();
        return ResponseEntity.ok(certifications);
    }

    @PostMapping("/certifications/update-statuses")
    public ResponseEntity<Void> updateCertificationStatuses() {
        log.info("POST /api/employees/training/certifications/update-statuses");
        trainingService.updateCertificationStatuses();
        return ResponseEntity.ok().build();
    }
}
