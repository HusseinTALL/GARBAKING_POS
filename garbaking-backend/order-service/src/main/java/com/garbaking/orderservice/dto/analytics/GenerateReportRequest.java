package com.garbaking.orderservice.dto.analytics;

import lombok.Data;

import java.util.Map;

@Data
public class GenerateReportRequest {
    private String type;
    private Map<String, Object> config;
}
