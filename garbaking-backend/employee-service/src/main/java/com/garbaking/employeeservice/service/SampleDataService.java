package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.model.*;
import com.garbaking.employeeservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

/**
 * Service for generating sample data for testing and demonstration purposes
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SampleDataService {

    private final TrainingProgramRepository trainingProgramRepository;
    private final CertificationTypeRepository certificationTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final EmployeeTrainingRepository employeeTrainingRepository;
    private final EmployeeCertificationRepository employeeCertificationRepository;

    private final Random random = new Random();

    @Transactional
    public String initializeSampleData() {
        log.info("Starting sample data initialization...");

        StringBuilder report = new StringBuilder();
        report.append("Sample Data Initialization Report\n");
        report.append("=====================================\n\n");

        // 1. Create Training Programs
        int programsCreated = createTrainingPrograms();
        report.append(String.format("✓ Training Programs: %d created\n", programsCreated));

        // 2. Create Certification Types
        int certTypesCreated = createCertificationTypes();
        report.append(String.format("✓ Certification Types: %d created\n", certTypesCreated));

        // 3. Check if employees exist
        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) {
            report.append("\n⚠ No employees found. Please create employees first.\n");
            report.append("Sample performance reviews, training, and certifications were not created.\n");
            return report.toString();
        }

        report.append(String.format("✓ Found %d employees\n\n", employees.size()));

        // 4. Create Sample Performance Reviews
        int reviewsCreated = createSamplePerformanceReviews(employees);
        report.append(String.format("✓ Performance Reviews: %d created\n", reviewsCreated));

        // 5. Assign Sample Training
        int trainingsAssigned = assignSampleTraining(employees);
        report.append(String.format("✓ Training Assignments: %d created\n", trainingsAssigned));

        // 6. Create Sample Certifications
        int certificationsCreated = createSampleCertifications(employees);
        report.append(String.format("✓ Employee Certifications: %d created\n", certificationsCreated));

        report.append("\n=====================================\n");
        report.append("Sample data initialization completed successfully!\n");

        log.info("Sample data initialization completed");
        return report.toString();
    }

    private int createTrainingPrograms() {
        if (trainingProgramRepository.count() > 0) {
            log.info("Training programs already exist, skipping...");
            return 0;
        }

        String[][] programs = {
                {"Food Safety & Hygiene", "Comprehensive training on food handling, storage, and sanitation practices.", "8", "true"},
                {"Customer Service Excellence", "Delivering exceptional customer experiences and handling complaints.", "4", "true"},
                {"POS System Training", "Hands-on training for the GARBAKING POS system.", "3", "true"},
                {"Cash Handling & Register Operations", "Proper cash handling procedures and drawer reconciliation.", "2", "true"},
                {"Kitchen Safety & Equipment", "Safe equipment operation and preventing workplace injuries.", "6", "true"},
                {"Allergen Awareness", "Identifying allergens and preventing cross-contamination.", "2", "true"},
                {"Alcohol Service & Responsibility", "Responsible alcohol service and legal compliance.", "4", "true"},
                {"Team Leadership & Management", "Leadership skills and team motivation for supervisors.", "12", "false"},
                {"Inventory Management Basics", "Inventory tracking, FIFO rotation, and waste minimization.", "3", "false"},
                {"Fire Safety & Emergency Procedures", "Fire prevention, evacuation, and emergency response.", "2", "true"}
        };

        int count = 0;
        for (String[] program : programs) {
            TrainingProgram tp = TrainingProgram.builder()
                    .title(program[0])
                    .description(program[1])
                    .durationHours(Integer.parseInt(program[2]))
                    .isMandatory(Boolean.parseBoolean(program[3]))
                    .isActive(true)
                    .build();
            trainingProgramRepository.save(tp);
            count++;
        }

        return count;
    }

    private int createCertificationTypes() {
        if (certificationTypeRepository.count() > 0) {
            log.info("Certification types already exist, skipping...");
            return 0;
        }

        String[][] certTypes = {
                {"Food Handler Certificate", "State Health Department", "24", "true"},
                {"Certified Food Protection Manager", "ServSafe / National Registry", "60", "true"},
                {"Responsible Beverage Service (RBS)", "State Alcohol Control Board", "36", "true"},
                {"First Aid / CPR Certification", "American Red Cross", "24", "false"},
                {"Allergen Awareness Certification", "Food Allergy Research & Education", "12", "true"},
                {"Heimlich Maneuver / Choking Response", "American Red Cross", "24", "false"},
                {"Sexual Harassment Prevention Training", "State Labor Department", "24", "true"},
                {"Fire Safety & Extinguisher Training", "Local Fire Department", "12", "true"}
        };

        int count = 0;
        for (String[] certType : certTypes) {
            CertificationType ct = CertificationType.builder()
                    .name(certType[0])
                    .issuingOrganization(certType[1])
                    .validityMonths(Integer.parseInt(certType[2]))
                    .isMandatory(Boolean.parseBoolean(certType[3]))
                    .isActive(true)
                    .renewalRequired(true)
                    .build();
            certificationTypeRepository.save(ct);
            count++;
        }

        return count;
    }

    private int createSamplePerformanceReviews(List<Employee> employees) {
        // Create reviews for a subset of employees
        int count = 0;
        int maxReviews = Math.min(employees.size(), 10); // Max 10 reviews

        for (int i = 0; i < maxReviews; i++) {
            Employee employee = employees.get(i);
            Employee reviewer = employees.get((i + 1) % employees.size()); // Use next employee as reviewer

            LocalDate reviewDate = LocalDate.now().minusMonths(random.nextInt(6));
            LocalDate periodEnd = reviewDate.minusDays(1);
            LocalDate periodStart = periodEnd.minusMonths(3);

            PerformanceReview review = PerformanceReview.builder()
                    .employee(employee)
                    .reviewer(reviewer)
                    .reviewDate(reviewDate)
                    .reviewPeriodStart(periodStart)
                    .reviewPeriodEnd(periodEnd)
                    .status(ReviewStatus.DRAFT)
                    .qualityOfWork(randomRating())
                    .productivity(randomRating())
                    .attendancePunctuality(randomRating())
                    .teamwork(randomRating())
                    .communication(randomRating())
                    .customerService(randomRating())
                    .initiative(randomRating())
                    .leadership(randomRating())
                    .strengths("Demonstrates strong work ethic and positive attitude. Consistently delivers quality results.")
                    .areasForImprovement("Could improve time management skills and proactive communication with team members.")
                    .goals("Focus on developing leadership skills and mentoring new team members in Q" + (random.nextInt(4) + 1) + ".")
                    .reviewerComments("Overall solid performance. Shows potential for growth with continued development.")
                    .build();

            review.calculateOverallRating();

            // Randomly complete some reviews
            if (random.nextBoolean()) {
                review.complete();

                // Randomly acknowledge some completed reviews
                if (random.nextBoolean()) {
                    review.acknowledge();
                    review.setEmployeeComments("Thank you for the feedback. I'm committed to continuous improvement.");
                }
            }

            performanceReviewRepository.save(review);
            count++;
        }

        return count;
    }

    private int assignSampleTraining(List<Employee> employees) {
        List<TrainingProgram> programs = trainingProgramRepository.findAll();
        if (programs.isEmpty()) {
            return 0;
        }

        int count = 0;
        int maxAssignments = Math.min(employees.size() * 2, 20); // Max 20 training assignments

        for (int i = 0; i < maxAssignments; i++) {
            Employee employee = employees.get(random.nextInt(employees.size()));
            TrainingProgram program = programs.get(random.nextInt(programs.size()));

            // Check if already assigned
            if (employeeTrainingRepository.findByEmployeeIdAndTrainingProgramId(employee.getId(), program.getId()).isPresent()) {
                continue;
            }

            LocalDate assignedDate = LocalDate.now().minusDays(random.nextInt(90));
            LocalDate dueDate = assignedDate.plusDays(30 + random.nextInt(30));

            TrainingStatus status = TrainingStatus.NOT_STARTED;
            LocalDate startDate = null;
            LocalDate completionDate = null;
            Integer score = null;

            // Randomly progress some trainings
            double progress = random.nextDouble();
            if (progress > 0.7) {
                // Completed
                status = TrainingStatus.COMPLETED;
                startDate = assignedDate.plusDays(random.nextInt(15));
                completionDate = startDate.plusDays(random.nextInt(program.getDurationHours() + 5));
                score = 70 + random.nextInt(31); // Score between 70-100
            } else if (progress > 0.4) {
                // In Progress
                status = TrainingStatus.IN_PROGRESS;
                startDate = assignedDate.plusDays(random.nextInt(15));
            }

            EmployeeTraining training = EmployeeTraining.builder()
                    .employee(employee)
                    .trainingProgram(program)
                    .status(status)
                    .assignedDate(assignedDate)
                    .startDate(startDate)
                    .completionDate(completionDate)
                    .dueDate(dueDate)
                    .score(score)
                    .build();

            employeeTrainingRepository.save(training);
            count++;
        }

        return count;
    }

    private int createSampleCertifications(List<Employee> employees) {
        List<CertificationType> certTypes = certificationTypeRepository.findAll();
        if (certTypes.isEmpty()) {
            return 0;
        }

        int count = 0;
        int maxCertifications = Math.min(employees.size() * 2, 25); // Max 25 certifications

        for (int i = 0; i < maxCertifications; i++) {
            Employee employee = employees.get(random.nextInt(employees.size()));
            CertificationType certType = certTypes.get(random.nextInt(certTypes.size()));

            // Check if already has this certification
            if (employeeCertificationRepository.findByEmployeeIdAndCertificationTypeId(employee.getId(), certType.getId()).isPresent()) {
                continue;
            }

            LocalDate issueDate = LocalDate.now().minusMonths(random.nextInt(certType.getValidityMonths()));
            LocalDate expirationDate = issueDate.plusMonths(certType.getValidityMonths());

            String certNumber = "CERT-" + certType.getId() + "-" + employee.getId() + "-" + System.currentTimeMillis();

            EmployeeCertification certification = EmployeeCertification.builder()
                    .employee(employee)
                    .certificationType(certType)
                    .certificationNumber(certNumber)
                    .issueDate(issueDate)
                    .expirationDate(expirationDate)
                    .status(CertificationStatus.PENDING)
                    .build();

            certification.updateStatus();

            // Randomly verify some certifications
            if (random.nextBoolean() && employees.size() > 1) {
                Employee verifier = employees.get(random.nextInt(employees.size()));
                certification.verify(verifier.getId());
            }

            employeeCertificationRepository.save(certification);
            count++;
        }

        return count;
    }

    private Integer randomRating() {
        // Generate ratings with a bias towards 3-5 (more realistic distribution)
        double rand = random.nextDouble();
        if (rand < 0.05) return 1;
        if (rand < 0.15) return 2;
        if (rand < 0.40) return 3;
        if (rand < 0.75) return 4;
        return 5;
    }
}
