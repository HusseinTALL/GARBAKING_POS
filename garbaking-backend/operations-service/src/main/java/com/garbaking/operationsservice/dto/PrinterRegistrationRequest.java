package com.garbaking.operationsservice.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class PrinterRegistrationRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String location;
}
