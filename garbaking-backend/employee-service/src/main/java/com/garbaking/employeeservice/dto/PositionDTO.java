package com.garbaking.employeeservice.dto;

import com.garbaking.employeeservice.model.PayType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for Position
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionDTO {
    private Long id;
    private String title;
    private String description;
    private Long departmentId;
    private String departmentName;
    private PayType payType;
    private BigDecimal basePayRate;
    private BigDecimal minPayRate;
    private BigDecimal maxPayRate;
    private Boolean isActive;
    private Boolean requiresCertification;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
