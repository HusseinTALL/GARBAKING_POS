package com.garbaking.employeeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for "Who's Working Now" dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhosWorkingDTO {
    private Integer totalClockedIn;
    private List<ActiveEmployeeDTO> activeEmployees;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActiveEmployeeDTO {
        private Long employeeId;
        private String employeeName;
        private String employeeNumber;
        private String positionTitle;
        private String departmentName;
        private LocalDateTime clockInTime;
        private BigDecimal currentHours;
        private String location;
    }
}
