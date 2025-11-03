package com.garbaking.operationsservice.dto;

import com.garbaking.operationsservice.model.LoyaltyTier;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class UpdateLoyaltyMemberRequest {

    @NotBlank
    private String fullName;

    @Email
    private String email;

    private LoyaltyTier tier;
}
