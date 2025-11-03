package com.garbaking.analyticsservice.service;

import com.garbaking.analyticsservice.dto.OperationsSummary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class RestOperationsClient implements OperationsClient {

    private static final Logger log = LoggerFactory.getLogger(RestOperationsClient.class);

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public RestOperationsClient(RestTemplate restTemplate, @Value("${operations.base-url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    @Override
    public OperationsSummary fetchSummary() {
        try {
            ResponseEntity<OperationsSummary> response = restTemplate.getForEntity(baseUrl + "/api/operations/summary", OperationsSummary.class);
            return response.getBody();
        } catch (RestClientException exception) {
            log.warn("Failed to fetch operations summary from {}: {}", baseUrl, exception.getMessage());
            return OperationsSummary
                .builder()
                .generatedAt(java.time.Instant.now())
                .build();
        }
    }
}
