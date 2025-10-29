package com.garbaking.inventoryservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Collections;
import java.util.List;

/**
 * Request payload for assigning suppliers to a menu item.
 */
@Data
public class SupplierAssignmentRequest {

    @NotNull
    private List<Long> supplierIds = Collections.emptyList();
}
