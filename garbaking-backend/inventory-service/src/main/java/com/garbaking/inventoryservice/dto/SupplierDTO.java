package com.garbaking.inventoryservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Supplier DTO used for create/update and responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDTO {

    private Long id;

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 150)
    private String contactName;

    @Email
    @Size(max = 150)
    private String contactEmail;

    @Size(max = 50)
    private String contactPhone;

    @Size(max = 255)
    private String website;

    @Min(0)
    private Integer leadTimeDays;

    private Boolean preferred;

    @Size(max = 1000)
    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
