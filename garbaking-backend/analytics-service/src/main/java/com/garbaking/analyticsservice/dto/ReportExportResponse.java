package com.garbaking.analyticsservice.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ReportExportResponse {
    ReportFormat format;
    String content;
    Instant generatedAt;
}
