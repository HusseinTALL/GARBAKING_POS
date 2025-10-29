package com.garbaking.orderservice.dto.analytics;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ScheduleReportRequest {
    private String name;
    private String type;
    private String schedule;
    private String format;
    private List<String> recipients;
    private Map<String, Object> filters;
    private boolean active = true;
}
