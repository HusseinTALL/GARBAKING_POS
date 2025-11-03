package com.garbaking.operationsservice.controller;

import com.garbaking.operationsservice.dto.CreateLoyaltyMemberRequest;
import com.garbaking.operationsservice.dto.LoyaltyTransactionRequest;
import com.garbaking.operationsservice.dto.RedeemRewardRequest;
import com.garbaking.operationsservice.dto.UpdateLoyaltyMemberRequest;
import com.garbaking.operationsservice.model.LoyaltyMember;
import com.garbaking.operationsservice.model.LoyaltyTransaction;
import com.garbaking.operationsservice.service.LoyaltyService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    public LoyaltyController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @PostMapping("/members")
    @ResponseStatus(HttpStatus.CREATED)
    public LoyaltyMember createMember(@Valid @RequestBody CreateLoyaltyMemberRequest request) {
        return loyaltyService.createMember(request);
    }

    @GetMapping("/members")
    public List<LoyaltyMember> listMembers() {
        return loyaltyService.listMembers();
    }

    @GetMapping("/members/{memberId}")
    public LoyaltyMember getMember(@PathVariable Long memberId) {
        return loyaltyService.getMember(memberId);
    }

    @PutMapping("/members/{memberId}")
    public LoyaltyMember updateMember(@PathVariable Long memberId, @Valid @RequestBody UpdateLoyaltyMemberRequest request) {
        return loyaltyService.updateMember(memberId, request);
    }

    @PostMapping("/members/{memberId}/transactions")
    public LoyaltyMember recordTransaction(
        @PathVariable Long memberId,
        @Valid @RequestBody LoyaltyTransactionRequest request
    ) {
        return loyaltyService.recordTransaction(memberId, request);
    }

    @GetMapping("/members/{memberId}/transactions")
    public List<LoyaltyTransaction> getTransactions(@PathVariable Long memberId) {
        return loyaltyService.getTransactionsForMember(memberId);
    }

    @PostMapping("/members/{memberId}/rewards/redeem")
    public LoyaltyMember redeemReward(@PathVariable Long memberId, @Valid @RequestBody RedeemRewardRequest request) {
        return loyaltyService.redeemReward(memberId, request);
    }
}
