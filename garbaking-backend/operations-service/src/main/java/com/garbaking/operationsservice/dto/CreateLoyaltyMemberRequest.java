package com.garbaking.operationsservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class CreateLoyaltyMemberRequest {

    @NotBlank
    private String fullName;

    @Email
    private String email;

    @Min(0)
    private int startingPoints = 0;
}
