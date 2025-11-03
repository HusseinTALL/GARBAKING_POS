package com.garbaking.operationsservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class RedeemRewardRequest {

    @NotBlank
    private String rewardName;

    @Min(1)
    private int points;
}
