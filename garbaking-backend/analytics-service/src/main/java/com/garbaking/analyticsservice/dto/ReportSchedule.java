package com.garbaking.analyticsservice.dto;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class ReportSchedule {
    Long id;
    String name;
    ReportFormat format;
    String cronExpression;
    List<String> recipients;
    Instant lastRunAt;
}
