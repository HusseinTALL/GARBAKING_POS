package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.CreateShiftTemplateRequest;
import com.garbaking.employeeservice.dto.ShiftTemplateDTO;
import com.garbaking.employeeservice.service.ShiftTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

/**
 * REST Controller for Shift Template operations
 */
@RestController
@RequestMapping("/api/employees/shift-templates")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class ShiftTemplateController {

    private final ShiftTemplateService shiftTemplateService;

    @PostMapping
    public ResponseEntity<ShiftTemplateDTO> createShiftTemplate(
            @Valid @RequestBody CreateShiftTemplateRequest request
    ) {
        log.info("POST /api/employees/shift-templates - Template: {}", request.getTemplateName());
        ShiftTemplateDTO template = shiftTemplateService.createShiftTemplate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(template);
    }

    @PutMapping("/{templateId}")
    public ResponseEntity<ShiftTemplateDTO> updateShiftTemplate(
            @PathVariable Long templateId,
            @Valid @RequestBody CreateShiftTemplateRequest request
    ) {
        log.info("PUT /api/employees/shift-templates/{}", templateId);
        ShiftTemplateDTO template = shiftTemplateService.updateShiftTemplate(templateId, request);
        return ResponseEntity.ok(template);
    }

    @PostMapping("/{templateId}/deactivate")
    public ResponseEntity<Void> deactivateShiftTemplate(@PathVariable Long templateId) {
        log.info("POST /api/employees/shift-templates/{}/deactivate", templateId);
        shiftTemplateService.deactivateShiftTemplate(templateId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{templateId}/activate")
    public ResponseEntity<Void> activateShiftTemplate(@PathVariable Long templateId) {
        log.info("POST /api/employees/shift-templates/{}/activate", templateId);
        shiftTemplateService.activateShiftTemplate(templateId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{templateId}")
    public ResponseEntity<Void> deleteShiftTemplate(@PathVariable Long templateId) {
        log.info("DELETE /api/employees/shift-templates/{}", templateId);
        shiftTemplateService.deleteShiftTemplate(templateId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{templateId}")
    public ResponseEntity<ShiftTemplateDTO> getShiftTemplateById(@PathVariable Long templateId) {
        log.info("GET /api/employees/shift-templates/{}", templateId);
        ShiftTemplateDTO template = shiftTemplateService.getShiftTemplateById(templateId);
        return ResponseEntity.ok(template);
    }

    @GetMapping
    public ResponseEntity<List<ShiftTemplateDTO>> getAllActiveShiftTemplates() {
        log.info("GET /api/employees/shift-templates");
        List<ShiftTemplateDTO> templates = shiftTemplateService.getAllActiveShiftTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/day/{dayOfWeek}")
    public ResponseEntity<List<ShiftTemplateDTO>> getShiftTemplatesByDay(
            @PathVariable DayOfWeek dayOfWeek
    ) {
        log.info("GET /api/employees/shift-templates/day/{}", dayOfWeek);
        List<ShiftTemplateDTO> templates = shiftTemplateService.getShiftTemplatesByDay(dayOfWeek);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/position/{positionId}")
    public ResponseEntity<List<ShiftTemplateDTO>> getShiftTemplatesByPosition(
            @PathVariable Long positionId
    ) {
        log.info("GET /api/employees/shift-templates/position/{}", positionId);
        List<ShiftTemplateDTO> templates = shiftTemplateService.getShiftTemplatesByPosition(positionId);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<ShiftTemplateDTO>> getShiftTemplatesByLocation(
            @PathVariable String location
    ) {
        log.info("GET /api/employees/shift-templates/location/{}", location);
        List<ShiftTemplateDTO> templates = shiftTemplateService.getShiftTemplatesByLocation(location);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ShiftTemplateDTO>> searchShiftTemplates(
            @RequestParam String name
    ) {
        log.info("GET /api/employees/shift-templates/search - Name: {}", name);
        List<ShiftTemplateDTO> templates = shiftTemplateService.searchShiftTemplates(name);
        return ResponseEntity.ok(templates);
    }
}
