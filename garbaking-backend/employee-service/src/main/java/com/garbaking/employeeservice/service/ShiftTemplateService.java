package com.garbaking.employeeservice.service;

import com.garbaking.employeeservice.dto.CreateShiftTemplateRequest;
import com.garbaking.employeeservice.dto.ShiftTemplateDTO;
import com.garbaking.employeeservice.model.Position;
import com.garbaking.employeeservice.model.ShiftTemplate;
import com.garbaking.employeeservice.repository.PositionRepository;
import com.garbaking.employeeservice.repository.ShiftTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Shift Template operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ShiftTemplateService {

    private final ShiftTemplateRepository shiftTemplateRepository;
    private final PositionRepository positionRepository;

    @Transactional
    public ShiftTemplateDTO createShiftTemplate(CreateShiftTemplateRequest request) {
        log.info("Creating shift template: {}", request.getTemplateName());

        // Validate position exists
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new RuntimeException("Position not found with ID: " + request.getPositionId()));

        // Validate start time is before end time
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        // Create template
        ShiftTemplate template = ShiftTemplate.builder()
                .templateName(request.getTemplateName())
                .description(request.getDescription())
                .position(position)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .breakMinutes(request.getBreakMinutes() != null ? request.getBreakMinutes() : 30)
                .requiredStaff(request.getRequiredStaff() != null ? request.getRequiredStaff() : 1)
                .location(request.getLocation())
                .isActive(true)
                .build();

        ShiftTemplate savedTemplate = shiftTemplateRepository.save(template);
        log.info("Shift template created successfully with ID: {}", savedTemplate.getId());

        return convertToDTO(savedTemplate);
    }

    @Transactional
    public ShiftTemplateDTO updateShiftTemplate(Long templateId, CreateShiftTemplateRequest request) {
        log.info("Updating shift template with ID: {}", templateId);

        ShiftTemplate template = shiftTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Shift template not found with ID: " + templateId));

        // Update fields
        if (request.getTemplateName() != null) {
            template.setTemplateName(request.getTemplateName());
        }
        if (request.getDescription() != null) {
            template.setDescription(request.getDescription());
        }
        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found with ID: " + request.getPositionId()));
            template.setPosition(position);
        }
        if (request.getDayOfWeek() != null) {
            template.setDayOfWeek(request.getDayOfWeek());
        }
        if (request.getStartTime() != null) {
            template.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            template.setEndTime(request.getEndTime());
        }
        if (request.getBreakMinutes() != null) {
            template.setBreakMinutes(request.getBreakMinutes());
        }
        if (request.getRequiredStaff() != null) {
            template.setRequiredStaff(request.getRequiredStaff());
        }
        if (request.getLocation() != null) {
            template.setLocation(request.getLocation());
        }

        // Validate times
        if (template.getStartTime() != null && template.getEndTime() != null &&
                !template.getStartTime().isBefore(template.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        ShiftTemplate updatedTemplate = shiftTemplateRepository.save(template);
        log.info("Shift template updated successfully: {}", templateId);

        return convertToDTO(updatedTemplate);
    }

    @Transactional
    public void deactivateShiftTemplate(Long templateId) {
        log.info("Deactivating shift template with ID: {}", templateId);

        ShiftTemplate template = shiftTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Shift template not found with ID: " + templateId));

        template.setIsActive(false);
        shiftTemplateRepository.save(template);

        log.info("Shift template deactivated successfully: {}", templateId);
    }

    @Transactional
    public void activateShiftTemplate(Long templateId) {
        log.info("Activating shift template with ID: {}", templateId);

        ShiftTemplate template = shiftTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Shift template not found with ID: " + templateId));

        template.setIsActive(true);
        shiftTemplateRepository.save(template);

        log.info("Shift template activated successfully: {}", templateId);
    }

    @Transactional
    public void deleteShiftTemplate(Long templateId) {
        log.info("Deleting shift template with ID: {}", templateId);

        ShiftTemplate template = shiftTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Shift template not found with ID: " + templateId));

        shiftTemplateRepository.delete(template);
        log.info("Shift template deleted successfully: {}", templateId);
    }

    @Transactional(readOnly = true)
    public ShiftTemplateDTO getShiftTemplateById(Long templateId) {
        log.info("Getting shift template by ID: {}", templateId);

        ShiftTemplate template = shiftTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Shift template not found with ID: " + templateId));

        return convertToDTO(template);
    }

    @Transactional(readOnly = true)
    public List<ShiftTemplateDTO> getAllActiveShiftTemplates() {
        log.info("Getting all active shift templates");

        List<ShiftTemplate> templates = shiftTemplateRepository.findByIsActiveTrue();
        return templates.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftTemplateDTO> getShiftTemplatesByDay(DayOfWeek dayOfWeek) {
        log.info("Getting shift templates for day: {}", dayOfWeek);

        List<ShiftTemplate> templates = shiftTemplateRepository.findByDayOfWeekAndIsActiveTrue(dayOfWeek);
        return templates.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftTemplateDTO> getShiftTemplatesByPosition(Long positionId) {
        log.info("Getting shift templates for position: {}", positionId);

        List<ShiftTemplate> templates = shiftTemplateRepository.findByPositionIdAndIsActiveTrue(positionId);
        return templates.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftTemplateDTO> getShiftTemplatesByLocation(String location) {
        log.info("Getting shift templates for location: {}", location);

        List<ShiftTemplate> templates = shiftTemplateRepository.findByLocationAndIsActiveTrue(location);
        return templates.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftTemplateDTO> searchShiftTemplates(String name) {
        log.info("Searching shift templates by name: {}", name);

        List<ShiftTemplate> templates = shiftTemplateRepository.searchByTemplateName(name);
        return templates.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ShiftTemplateDTO convertToDTO(ShiftTemplate template) {
        return ShiftTemplateDTO.builder()
                .id(template.getId())
                .templateName(template.getTemplateName())
                .description(template.getDescription())
                .positionId(template.getPosition().getId())
                .positionTitle(template.getPosition().getTitle())
                .dayOfWeek(template.getDayOfWeek())
                .startTime(template.getStartTime())
                .endTime(template.getEndTime())
                .breakMinutes(template.getBreakMinutes())
                .requiredStaff(template.getRequiredStaff())
                .location(template.getLocation())
                .isActive(template.getIsActive())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
