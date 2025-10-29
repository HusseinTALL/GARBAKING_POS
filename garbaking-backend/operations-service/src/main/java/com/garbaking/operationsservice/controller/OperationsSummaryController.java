package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.model.OperationsSummary;
import com.garbaking.operationsservice.service.OperationsSummaryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/operations")
public class OperationsSummaryController {

    private final OperationsSummaryService operationsSummaryService;

    public OperationsSummaryController(OperationsSummaryService operationsSummaryService) {
        this.operationsSummaryService = operationsSummaryService;
    }

    @GetMapping("/summary")
    public OperationsSummary getSummary() {
        return operationsSummaryService.buildSummary();
    }
}
