package com.garbaking.operationsservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.garbaking.operationsservice.dto.CreateLoyaltyMemberRequest;
import com.garbaking.operationsservice.dto.LoyaltyTransactionRequest;
import com.garbaking.operationsservice.dto.RedeemRewardRequest;
import com.garbaking.operationsservice.dto.UpdateLoyaltyMemberRequest;
import com.garbaking.operationsservice.model.LoyaltyTier;
import com.garbaking.operationsservice.model.LoyaltyTransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class LoyaltyServiceTest {

    private LoyaltyService loyaltyService;

    @BeforeEach
    void setUp() {
        loyaltyService = new LoyaltyService();
    }

    @Test
    void createsMemberAndInitialTransaction() {
        CreateLoyaltyMemberRequest request = new CreateLoyaltyMemberRequest();
        request.setFullName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setStartingPoints(1500);

        var member = loyaltyService.createMember(request);

        assertThat(member.getTier()).isEqualTo(LoyaltyTier.SILVER);
        assertThat(loyaltyService.getTransactionsForMember(member.getId())).hasSize(1);
    }

    @Test
    void preventsRedemptionWhenInsufficientPoints() {
        CreateLoyaltyMemberRequest request = new CreateLoyaltyMemberRequest();
        request.setFullName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setStartingPoints(10);
        var member = loyaltyService.createMember(request);

        RedeemRewardRequest redeem = new RedeemRewardRequest();
        redeem.setRewardName("Free Coffee");
        redeem.setPoints(100);

        assertThatThrownBy(() -> loyaltyService.redeemReward(member.getId(), redeem)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void recordsEarnAndRedeemTransactions() {
        CreateLoyaltyMemberRequest request = new CreateLoyaltyMemberRequest();
        request.setFullName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setStartingPoints(0);
        var member = loyaltyService.createMember(request);

        LoyaltyTransactionRequest earn = new LoyaltyTransactionRequest();
        earn.setType(LoyaltyTransactionType.EARN);
        earn.setPoints(200);
        loyaltyService.recordTransaction(member.getId(), earn);

        RedeemRewardRequest redeem = new RedeemRewardRequest();
        redeem.setRewardName("Free Cookie");
        redeem.setPoints(50);
        loyaltyService.redeemReward(member.getId(), redeem);

        var updated = loyaltyService.getMember(member.getId());
        assertThat(updated.getPointsBalance()).isEqualTo(150);
        assertThat(updated.getRewardRedemptions()).containsEntry("Free Cookie", 1);
    }

    @Test
    void updatesMemberProfile() {
        CreateLoyaltyMemberRequest request = new CreateLoyaltyMemberRequest();
        request.setFullName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setStartingPoints(0);
        var member = loyaltyService.createMember(request);

        UpdateLoyaltyMemberRequest update = new UpdateLoyaltyMemberRequest();
        update.setFullName("Jane Smith");
        update.setEmail("jane.smith@example.com");
        update.setTier(LoyaltyTier.GOLD);

        var updated = loyaltyService.updateMember(member.getId(), update);
        assertThat(updated.getFullName()).isEqualTo("Jane Smith");
        assertThat(updated.getEmail()).isEqualTo("jane.smith@example.com");
        assertThat(updated.getTier()).isEqualTo(LoyaltyTier.GOLD);
    }
}
