package com.garbaking.operationsservice.dto;

import com.garbaking.operationsservice.model.ExportFormat;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class ReceiptExportRequest {

    @NotNull
    private ExportFormat format;
}
