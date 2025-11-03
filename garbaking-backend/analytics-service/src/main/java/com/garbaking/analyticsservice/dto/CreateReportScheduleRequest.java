package com.garbaking.analyticsservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class CreateReportScheduleRequest {

    @NotBlank
    private String name;

    @NotNull
    private ReportFormat format;

    @NotBlank
    private String cronExpression;

    @NotEmpty
    private List<@NotBlank String> recipients;
}
