package com.garbaking.operationsservice.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyMember {

    private Long id;
    private String fullName;
    private String email;
    private int pointsBalance;
    private int lifetimePoints;
    private LoyaltyTier tier;
    private LocalDate enrolledOn;
    private Instant lastActivityAt;
    private Map<String, Integer> rewardRedemptions;

    public Map<String, Integer> getRewardRedemptions() {
        if (rewardRedemptions == null) {
            rewardRedemptions = new HashMap<>();
        }
        return rewardRedemptions;
    }
}
