package com.garbaking.inventoryservice.dto;

import lombok.Builder;
import lombok.Value;

/**
 * Lightweight supplier summary returned with menu items.
 */
@Value
@Builder
public class SupplierSummaryDTO {
    Long id;
    String name;
    Boolean preferred;
    Integer leadTimeDays;
}
