package com.garbaking.operationsservice.dto.cash;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CashDrawerRegistrationRequest {

    @NotBlank(message = "Drawer name is required")
    private String name;

    @NotBlank(message = "Terminal ID is required")
    private String terminalId;

    private String location;
}
