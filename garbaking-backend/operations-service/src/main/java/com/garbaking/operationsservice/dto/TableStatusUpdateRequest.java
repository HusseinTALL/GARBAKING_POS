package com.garbaking.operationsservice.dto;

import com.garbaking.operationsservice.model.TableStatus;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class TableStatusUpdateRequest {

    @NotNull
    private TableStatus status;
}
