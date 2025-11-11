package com.garbaking.employeeservice.controller;

import com.garbaking.employeeservice.dto.PositionDTO;
import com.garbaking.employeeservice.model.Position;
import com.garbaking.employeeservice.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for Position operations
 */
@RestController
@RequestMapping("/api/employees/positions")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class PositionController {

    private final PositionRepository positionRepository;

    @GetMapping
    public ResponseEntity<List<PositionDTO>> getAllPositions(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        log.info("GET /api/employees/positions - activeOnly: {}", activeOnly);
        List<Position> positions = activeOnly
                ? positionRepository.findByIsActiveTrue()
                : positionRepository.findAll();

        List<PositionDTO> dtos = positions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PositionDTO> getPositionById(@PathVariable Long id) {
        log.info("GET /api/employees/positions/{}", id);
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Position not found with id: " + id));
        return ResponseEntity.ok(convertToDTO(position));
    }

    private PositionDTO convertToDTO(Position position) {
        return PositionDTO.builder()
                .id(position.getId())
                .title(position.getTitle())
                .description(position.getDescription())
                .departmentId(position.getDepartment() != null ? position.getDepartment().getId() : null)
                .departmentName(position.getDepartment() != null ? position.getDepartment().getName() : null)
                .payType(position.getPayType())
                .basePayRate(position.getBasePayRate())
                .minPayRate(position.getMinPayRate())
                .maxPayRate(position.getMaxPayRate())
                .isActive(position.getIsActive())
                .requiresCertification(position.getRequiresCertification())
                .createdAt(position.getCreatedAt())
                .updatedAt(position.getUpdatedAt())
                .build();
    }
}
