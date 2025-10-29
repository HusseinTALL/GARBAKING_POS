package com.garbaking.operationsservice.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class PrinterJobRequest {

    @NotBlank
    private String payloadType;

    @NotBlank
    private String referenceId;
}
