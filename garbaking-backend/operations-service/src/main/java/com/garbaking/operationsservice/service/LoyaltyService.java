package com.garbaking.operationsservice.service;

import com.garbaking.operationsservice.dto.CreateLoyaltyMemberRequest;
import com.garbaking.operationsservice.dto.LoyaltyTransactionRequest;
import com.garbaking.operationsservice.dto.RedeemRewardRequest;
import com.garbaking.operationsservice.dto.UpdateLoyaltyMemberRequest;
import com.garbaking.operationsservice.model.LoyaltyMember;
import com.garbaking.operationsservice.model.LoyaltyTier;
import com.garbaking.operationsservice.model.LoyaltyTransaction;
import com.garbaking.operationsservice.model.LoyaltyTransactionType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class LoyaltyService {

    private final Map<Long, LoyaltyMember> members = new ConcurrentHashMap<>();
    private final Map<Long, List<LoyaltyTransaction>> transactions = new ConcurrentHashMap<>();
    private final AtomicLong memberIdSequence = new AtomicLong(1);
    private final AtomicLong transactionIdSequence = new AtomicLong(1);

    public LoyaltyMember createMember(CreateLoyaltyMemberRequest request) {
        Long id = memberIdSequence.getAndIncrement();
        LoyaltyMember member = LoyaltyMember
            .builder()
            .id(id)
            .fullName(request.getFullName())
            .email(request.getEmail())
            .pointsBalance(request.getStartingPoints())
            .lifetimePoints(request.getStartingPoints())
            .tier(resolveTier(request.getStartingPoints()))
            .enrolledOn(LocalDate.now())
            .lastActivityAt(Instant.now())
            .build();
        members.put(id, member);
        if (request.getStartingPoints() > 0) {
            LoyaltyTransactionRequest bootstrapTransaction = new LoyaltyTransactionRequest();
            bootstrapTransaction.setType(LoyaltyTransactionType.EARN);
            bootstrapTransaction.setPoints(request.getStartingPoints());
            bootstrapTransaction.setDescription("Initial enrollment bonus");
            recordTransactionInternal(id, bootstrapTransaction);
        }
        return member;
    }

    public LoyaltyMember updateMember(Long id, UpdateLoyaltyMemberRequest request) {
        LoyaltyMember member = requireMember(id);
        if (StringUtils.hasText(request.getFullName())) {
            member.setFullName(request.getFullName());
        }
        if (StringUtils.hasText(request.getEmail())) {
            member.setEmail(request.getEmail());
        }
        if (request.getTier() != null) {
            member.setTier(request.getTier());
        }
        return member;
    }

    public LoyaltyMember recordTransaction(Long memberId, LoyaltyTransactionRequest request) {
        LoyaltyMember member = requireMember(memberId);
        if (request.getType() == LoyaltyTransactionType.REDEEM && request.getPoints() > member.getPointsBalance()) {
            throw new IllegalArgumentException("Insufficient points for redemption");
        }
        LoyaltyTransaction transaction = recordTransactionInternal(memberId, request);
        if (request.getType() == LoyaltyTransactionType.EARN) {
            member.setPointsBalance(member.getPointsBalance() + request.getPoints());
            member.setLifetimePoints(member.getLifetimePoints() + request.getPoints());
        } else {
            member.setPointsBalance(member.getPointsBalance() - request.getPoints());
            member.getRewardRedemptions().merge(request.getDescription(), 1, Integer::sum);
        }
        member.setTier(resolveTier(member.getLifetimePoints()));
        member.setLastActivityAt(transaction.getOccurredAt());
        return member;
    }

    public LoyaltyMember redeemReward(Long memberId, RedeemRewardRequest request) {
        LoyaltyTransactionRequest transactionRequest = new LoyaltyTransactionRequest();
        transactionRequest.setType(LoyaltyTransactionType.REDEEM);
        transactionRequest.setPoints(request.getPoints());
        transactionRequest.setDescription(request.getRewardName());
        return recordTransaction(memberId, transactionRequest);
    }

    public List<LoyaltyMember> listMembers() {
        return new ArrayList<>(members.values());
    }

    public LoyaltyMember getMember(Long id) {
        return requireMember(id);
    }

    public List<LoyaltyTransaction> getTransactionsForMember(Long memberId) {
        return transactions.containsKey(memberId)
            ? new ArrayList<>(transactions.get(memberId))
            : Collections.emptyList();
    }

    public Map<Long, LoyaltyMember> getMemberStore() {
        return members;
    }

    public Map<Long, List<LoyaltyTransaction>> getTransactionStore() {
        return transactions;
    }

    private LoyaltyMember requireMember(Long memberId) {
        LoyaltyMember member = members.get(memberId);
        if (member == null) {
            throw new IllegalArgumentException("Loyalty member not found");
        }
        return member;
    }

    private LoyaltyTransaction recordTransactionInternal(Long memberId, LoyaltyTransactionRequest request) {
        if (request.getPoints() <= 0) {
            throw new IllegalArgumentException("Points must be positive");
        }
        LoyaltyTransaction transaction = LoyaltyTransaction
            .builder()
            .id(transactionIdSequence.getAndIncrement())
            .memberId(memberId)
            .type(request.getType())
            .points(request.getPoints())
            .description(request.getDescription())
            .occurredAt(Instant.now())
            .build();
        transactions.computeIfAbsent(memberId, unused -> new ArrayList<>()).add(transaction);
        return transaction;
    }

    private LoyaltyTier resolveTier(int lifetimePoints) {
        if (lifetimePoints >= 5000) {
            return LoyaltyTier.PLATINUM;
        }
        if (lifetimePoints >= 2500) {
            return LoyaltyTier.GOLD;
        }
        if (lifetimePoints >= 1000) {
            return LoyaltyTier.SILVER;
        }
        return LoyaltyTier.BRONZE;
    }
}
