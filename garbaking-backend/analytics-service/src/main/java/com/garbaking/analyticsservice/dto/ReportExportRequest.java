package com.garbaking.analyticsservice.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;
import lombok.Data;

@Data
public class ReportExportRequest {

    @NotNull
    private ReportFormat format;

    private Map<String, String> filters;
}
