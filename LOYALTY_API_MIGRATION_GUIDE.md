# Loyalty API Migration Guide
**Date:** November 16, 2025
**Status:** In Progress

## Summary

This guide documents the migration of the Loyalty API from the expected frontend endpoints to the actual Spring Boot backend endpoints.

## Backend Endpoints (Actual - operations-service)

```java
// LoyaltyController.java
POST   /api/loyalty/members                      → Create loyalty member
GET    /api/loyalty/members                      → List all members
GET    /api/loyalty/members/{memberId}           → Get member details
PUT    /api/loyalty/members/{memberId}           → Update member
POST   /api/loyalty/members/{memberId}/transactions        → Record transaction (earn/spend points)
GET    /api/loyalty/members/{memberId}/transactions        → Get member transactions
POST   /api/loyalty/members/{memberId}/rewards/redeem      → Redeem reward
```

## Frontend API Mapping

### Update Required in `/frontend/admin-pos/src/services/api-spring.ts`

Replace the entire `loyaltyApi` object (lines 975-1138) with the updated version in `/tmp/loyalty-api-updated.ts`.

### Key Changes:

1. **Endpoint Mapping:**
   - `/api/loyalty/customers/*` → `/api/loyalty/members/*`
   - `/api/loyalty/customer/{id}/*` → `/api/loyalty/members/{id}/*`
   - Rewards & Redemptions → Both use `/transactions` endpoint, filtered by positive/negative `pointsChange`

2. **ID Type Handling:**
   - All ID parameters now accept `string | number`
   - Convert to number using `toNumber()` before API calls
   - Backend expects `Long` (numeric) IDs

3. **Transaction Types:**
   - `getCustomerRewards()` - filters transactions where `pointsChange > 0`
   - `getCustomerRedemptions()` - filters transactions where `pointsChange < 0`
   - `awardPoints()` - creates transaction with `transactionType: 'EARNED'`
   - `redeemPoints()` - calls `/rewards/redeem` endpoint

4. **Not Implemented (Backend TODO):**
   - Programs management (`/programs/*`)
   - Tiers management (`/tiers/*`)
   - Campaigns (`/campaigns/*`)
   - Analytics endpoints (`/analytics/*`)
   - All non-implemented methods log warnings and return empty/error responses

## Manual Steps to Complete Migration

### Step 1: Update api-spring.ts

```bash
# Backup current file
cp frontend/admin-pos/src/services/api-spring.ts frontend/admin-pos/src/services/api-spring.ts.backup

# Replace loyalty API section (lines 975-1138)
# Use your editor to replace the loyaltyApi export with content from /tmp/loyalty-api-updated.ts
```

### Step 2: Update TypeScript Types

Update `/frontend/admin-pos/src/services/loyalty.ts`:

```typescript
// Change type definitions
export interface LoyaltyCustomer {
  id: number  // Changed from string
  loyaltyPoints: number
  // ... rest remains same
}

export interface LoyaltyTier {
  id: number  // Changed from string
  programId: number  // Changed from string
  // ... rest remains same
}

// Similar changes for:
// - LoyaltyProgram
// - LoyaltyCampaign
// - LoyaltyReward
// - LoyaltyRedemption
```

### Step 3: Update Stores

Update `/frontend/admin-pos/src/stores/loyalty.ts`:

```typescript
// Ensure all ID comparisons handle both string and number
const findMember = (id: string | number) => {
  const numId = Number(id)
  return members.value.find(m => Number(m.id) === numId)
}
```

### Step 4: Test

```bash
# Start backend services
cd garbaking-backend
docker-compose up -d mysql kafka
./gradlew :operations-service:bootRun

# Start frontend
cd frontend/admin-pos
npm run dev

# Test loyalty features:
# 1. View loyalty members
# 2. Create new member
# 3. Award points
# 4. Redeem points
# 5. View transaction history
```

## Backend DTOs Reference

### LoyaltyMember (Java)

```java
public class LoyaltyMember {
    private Long id;
    private Long userId;
    private Integer pointsBalance;
    private String tier;
    private LocalDateTime joinedAt;
    private LocalDateTime lastActivityAt;
}
```

### LoyaltyTransaction (Java)

```java
public class LoyaltyTransaction {
    private Long id;
    private Long memberId;
    private String transactionType;  // EARNED, REDEEMED, EXPIRED, ADJUSTED
    private Integer pointsChange;     // Positive for earned, negative for redeemed
    private String description;
    private Long orderId;  // Optional
    private LocalDateTime createdAt;
}
```

### CreateLoyaltyMemberRequest (Java)

```java
public class CreateLoyaltyMemberRequest {
    @NotNull
    private Long userId;
    private String tier;
    private Integer initialPoints;
}
```

### LoyaltyTransactionRequest (Java)

```java
public class LoyaltyTransactionRequest {
    @NotNull
    private String transactionType;
    @NotNull
    private Integer pointsChange;
    private String description;
    private Long orderId;
}
```

### RedeemRewardRequest (Java)

```java
public class RedeemRewardRequest {
    @NotNull
    private Integer pointsToRedeem;
    private String redemptionType;  // DISCOUNT, FREE_ITEM, PERCENTAGE_OFF
    private String description;
}
```

## Response Mapping Examples

### Get Member Response

**Backend:**
```json
{
  "id": 123,
  "userId": 456,
  "pointsBalance": 500,
  "tier": "GOLD",
  "joinedAt": "2025-01-15T10:00:00",
  "lastActivityAt": "2025-11-16T12:00:00"
}
```

**Frontend Mapping:**
```typescript
{
  id: "123",  // Or keep as number after type update
  loyaltyPoints: 500,
  tier: { name: "GOLD", ... },  // May need enrichment
  joinDate: "2025-01-15T10:00:00",
  // Other fields calculated/enriched
}
```

### Get Transactions Response

**Backend:**
```json
[
  {
    "id": 1,
    "memberId": 123,
    "transactionType": "EARNED",
    "pointsChange": 50,
    "description": "Purchase reward",
    "orderId": 789,
    "createdAt": "2025-11-16T12:00:00"
  },
  {
    "id": 2,
    "memberId": 123,
    "transactionType": "REDEEMED",
    "pointsChange": -30,
    "description": "Discount applied",
    "orderId": null,
    "createdAt": "2025-11-16T13:00:00"
  }
]
```

**Frontend Filtering:**
```typescript
// For getCustomerRewards() - filter pointsChange > 0
[
  {
    id: "1",
    points: 50,
    type: "EARNED",
    reason: "Purchase reward",
    orderId: "789",
    createdAt: "2025-11-16T12:00:00"
  }
]

// For getCustomerRedemptions() - filter pointsChange < 0
[
  {
    id: "2",
    pointsUsed: 30,
    type: "REDEEMED",
    description: "Discount applied",
    createdAt: "2025-11-16T13:00:00"
  }
]
```

## Known Issues & Workarounds

### Issue 1: Programs Not Implemented

**Impact:** Cannot create/manage loyalty programs in UI
**Workaround:** Use default/hardcoded program for now
**Solution:** Add program management endpoints to backend (Phase 2)

### Issue 2: Tiers Not Dynamic

**Impact:** Tier assignment/upgrades must be manual
**Workaround:** Update tier via `PUT /members/{id}` with tier name
**Solution:** Add tier management + auto-upgrade logic (Phase 2)

### Issue 3: Analytics Not Available

**Impact:** Dashboard shows zeros for loyalty metrics
**Workaround:** Client-side aggregation from member/transaction data
**Solution:** Add analytics endpoints to backend (Phase 2)

## Testing Checklist

- [ ] Can create new loyalty member
- [ ] Can view all members
- [ ] Can view member details
- [ ] Can update member information
- [ ] Can award points to member
- [ ] Can redeem points from member
- [ ] Transaction history shows correctly
- [ ] Rewards filter shows only earned points
- [ ] Redemptions filter shows only redeemed points
- [ ] Point balance updates correctly
- [ ] Numeric IDs handled properly
- [ ] Error messages display correctly for unimplemented features

## Migration Status

- [x] API mismatch identified
- [x] Backend endpoints documented
- [x] Frontend API mapping designed
- [ ] api-spring.ts loyaltyApi updated
- [ ] loyalty.ts types updated to numeric IDs
- [ ] loyalty store updated
- [ ] Integration tested
- [ ] Documentation updated

## Next Steps

1. Apply the loyalty API changes to api-spring.ts
2. Update TypeScript type definitions
3. Test with running backend
4. Create backend tickets for missing features (programs, tiers, campaigns, analytics)
5. Move to next priority (upload service optimization)

---

**Report Generated:** 2025-11-16
**Last Updated:** 2025-11-16
**Status:** Ready for implementation
