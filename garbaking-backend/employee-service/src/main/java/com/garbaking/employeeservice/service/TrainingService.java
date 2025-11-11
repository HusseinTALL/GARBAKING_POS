package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.EmployeeCertificationDTO;
import com.garbaking.employeeservice.dto.EmployeeTrainingDTO;
import com.garbaking.employeeservice.model.*;
import com.garbaking.employeeservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Training and Certification operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TrainingService {

    private final EmployeeTrainingRepository trainingRepository;
    private final TrainingProgramRepository programRepository;
    private final EmployeeCertificationRepository certificationRepository;
    private final CertificationTypeRepository certificationTypeRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public EmployeeTrainingDTO assignTraining(Long employeeId, Long programId, LocalDate dueDate) {
        log.info("Assigning training program {} to employee {}", programId, employeeId);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));

        TrainingProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Training program not found: " + programId));

        EmployeeTraining training = EmployeeTraining.builder()
                .employee(employee)
                .trainingProgram(program)
                .status(TrainingStatus.NOT_STARTED)
                .assignedDate(LocalDate.now())
                .dueDate(dueDate)
                .build();

        EmployeeTraining savedTraining = trainingRepository.save(training);
        return convertTrainingToDTO(savedTraining);
    }

    @Transactional
    public EmployeeTrainingDTO completeTraining(Long trainingId, Integer score, String certificateUrl) {
        log.info("Completing training: {}", trainingId);

        EmployeeTraining training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new RuntimeException("Training not found: " + trainingId));

        training.complete(score, certificateUrl);
        EmployeeTraining savedTraining = trainingRepository.save(training);

        return convertTrainingToDTO(savedTraining);
    }

    @Transactional(readOnly = true)
    public List<EmployeeTrainingDTO> getTrainingForEmployee(Long employeeId) {
        List<EmployeeTraining> trainings = trainingRepository.findByEmployeeId(employeeId);
        return trainings.stream().map(this::convertTrainingToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeTrainingDTO> getOverdueTraining() {
        List<EmployeeTraining> trainings = trainingRepository.findOverdueTraining(LocalDate.now());
        return trainings.stream().map(this::convertTrainingToDTO).collect(Collectors.toList());
    }

    @Transactional
    public EmployeeCertificationDTO addCertification(Long employeeId, Long certificationTypeId,
                                                    String certificationNumber, LocalDate issueDate,
                                                    LocalDate expirationDate) {
        log.info("Adding certification {} for employee {}", certificationTypeId, employeeId);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));

        CertificationType certificationType = certificationTypeRepository.findById(certificationTypeId)
                .orElseThrow(() -> new RuntimeException("Certification type not found: " + certificationTypeId));

        EmployeeCertification certification = EmployeeCertification.builder()
                .employee(employee)
                .certificationType(certificationType)
                .certificationNumber(certificationNumber)
                .issueDate(issueDate)
                .expirationDate(expirationDate)
                .status(CertificationStatus.PENDING)
                .build();

        certification.updateStatus();
        EmployeeCertification savedCertification = certificationRepository.save(certification);

        return convertCertificationToDTO(savedCertification);
    }

    @Transactional
    public EmployeeCertificationDTO verifyCertification(Long certificationId, Long verifierId) {
        log.info("Verifying certification: {}", certificationId);

        EmployeeCertification certification = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new RuntimeException("Certification not found: " + certificationId));

        certification.verify(verifierId);
        EmployeeCertification savedCertification = certificationRepository.save(certification);

        return convertCertificationToDTO(savedCertification);
    }

    @Transactional(readOnly = true)
    public List<EmployeeCertificationDTO> getCertificationsForEmployee(Long employeeId) {
        List<EmployeeCertification> certifications = certificationRepository.findByEmployeeId(employeeId);
        return certifications.stream().map(this::convertCertificationToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeCertificationDTO> getExpiringSoonCertifications() {
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysFromNow = today.plusDays(30);
        List<EmployeeCertification> certifications = certificationRepository.findExpiringSoon(today, thirtyDaysFromNow);
        return certifications.stream().map(this::convertCertificationToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void updateCertificationStatuses() {
        log.info("Updating certification statuses");

        List<EmployeeCertification> allCertifications = certificationRepository.findAll();
        for (EmployeeCertification certification : allCertifications) {
            certification.updateStatus();
            certificationRepository.save(certification);
        }

        log.info("Updated {} certifications", allCertifications.size());
    }

    private EmployeeTrainingDTO convertTrainingToDTO(EmployeeTraining training) {
        return EmployeeTrainingDTO.builder()
                .id(training.getId())
                .employeeId(training.getEmployee().getId())
                .employeeName(training.getEmployee().getFullName())
                .employeeNumber(training.getEmployee().getEmployeeNumber())
                .trainingProgramId(training.getTrainingProgram().getId())
                .trainingProgramTitle(training.getTrainingProgram().getTitle())
                .durationHours(training.getTrainingProgram().getDurationHours())
                .status(training.getStatus())
                .assignedDate(training.getAssignedDate())
                .startDate(training.getStartDate())
                .completionDate(training.getCompletionDate())
                .dueDate(training.getDueDate())
                .isOverdue(training.isOverdue())
                .score(training.getScore())
                .trainerName(training.getTrainerName())
                .notes(training.getNotes())
                .certificateUrl(training.getCertificateUrl())
                .createdAt(training.getCreatedAt())
                .updatedAt(training.getUpdatedAt())
                .build();
    }

    private EmployeeCertificationDTO convertCertificationToDTO(EmployeeCertification certification) {
        EmployeeCertificationDTO dto = EmployeeCertificationDTO.builder()
                .id(certification.getId())
                .employeeId(certification.getEmployee().getId())
                .employeeName(certification.getEmployee().getFullName())
                .employeeNumber(certification.getEmployee().getEmployeeNumber())
                .certificationTypeId(certification.getCertificationType().getId())
                .certificationTypeName(certification.getCertificationType().getName())
                .issuingOrganization(certification.getCertificationType().getIssuingOrganization())
                .certificationNumber(certification.getCertificationNumber())
                .issueDate(certification.getIssueDate())
                .expirationDate(certification.getExpirationDate())
                .status(certification.getStatus())
                .daysUntilExpiration(certification.getDaysUntilExpiration())
                .isExpired(certification.isExpired())
                .isExpiringSoon(certification.isExpiringSoon())
                .verifiedBy(certification.getVerifiedBy())
                .verifiedAt(certification.getVerifiedAt())
                .certificateUrl(certification.getCertificateUrl())
                .notes(certification.getNotes())
                .createdAt(certification.getCreatedAt())
                .updatedAt(certification.getUpdatedAt())
                .build();

        if (certification.getVerifiedBy() != null) {
            employeeRepository.findById(certification.getVerifiedBy())
                    .ifPresent(verifier -> dto.setVerifiedByName(verifier.getFullName()));
        }

        return dto;
    }
}
