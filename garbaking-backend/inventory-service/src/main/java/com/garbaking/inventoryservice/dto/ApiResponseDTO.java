package com.garbaking.inventoryservice.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ApiResponseDTO<T> {
    boolean success;
    T data;
    String message;
}
