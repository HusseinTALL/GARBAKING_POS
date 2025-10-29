package com.garbaking.analyticsservice.service;

import com.garbaking.analyticsservice.dto.OperationsSummary;

public interface OperationsClient {
    OperationsSummary fetchSummary();
}
