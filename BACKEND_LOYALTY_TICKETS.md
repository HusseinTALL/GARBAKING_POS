# Backend Development Tickets - Loyalty Features

**Project:** Garbaking POS - Operations Service
**Component:** Loyalty Management System
**Priority:** High
**Sprint:** Backend Integration Phase 2

---

## 📋 Ticket Overview

This document contains 5 backend development tickets for implementing missing loyalty features. The frontend has already been migrated and is ready to consume these endpoints.

**Status:**
- ✅ Frontend: Ready and waiting
- ❌ Backend: Not yet implemented

---

## Ticket #1: Implement Loyalty Programs Management

**Type:** Feature
**Priority:** High
**Component:** operations-service
**Estimated Effort:** 6-8 hours
**Labels:** `backend`, `loyalty`, `enhancement`, `api`

### Description

Implement CRUD operations for Loyalty Programs. The frontend already has complete UI and API clients ready to consume these endpoints. Currently, the loyalty system only supports members and transactions, but cannot manage programs.

### Current State

**Database:**
- No `loyalty_programs` table exists
- Members are created without program association

**Frontend Status:**
- ✅ UI components ready
- ✅ API client implemented (`loyaltyApi.getPrograms()`, etc.)
- ✅ Pinia store ready
- ⚠️ Shows console warnings: "Backend endpoint not implemented"

### Requirements

#### Functional Requirements

1. **List Programs** - Get all loyalty programs for a store
2. **Get Program** - Get specific program by ID
3. **Create Program** - Create new loyalty program
4. **Update Program** - Update existing program settings
5. **Delete Program** - Soft delete a program
6. **Get Active Programs** - Filter only active programs
7. **Program Validation** - Validate program settings and dates

#### API Endpoints to Implement

```java
// LoyaltyProgramController.java
@RestController
@RequestMapping("/api/loyalty/programs")
public class LoyaltyProgramController {

    @GetMapping
    public List<LoyaltyProgram> listPrograms(@RequestParam(required = false) Long storeId) {
        // Return all programs, optionally filtered by store
    }

    @GetMapping("/{programId}")
    public LoyaltyProgram getProgram(@PathVariable Long programId) {
        // Return specific program with tiers and campaigns
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LoyaltyProgram createProgram(@Valid @RequestBody CreateProgramRequest request) {
        // Create new loyalty program
    }

    @PutMapping("/{programId}")
    public LoyaltyProgram updateProgram(
        @PathVariable Long programId,
        @Valid @RequestBody UpdateProgramRequest request
    ) {
        // Update program settings
    }

    @DeleteMapping("/{programId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProgram(@PathVariable Long programId) {
        // Soft delete (set isActive = false)
    }

    @GetMapping("/active")
    public List<LoyaltyProgram> getActivePrograms(@RequestParam(required = false) Long storeId) {
        // Return only active programs
    }
}
```

#### Database Schema

```sql
CREATE TABLE loyalty_programs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    points_per_dollar DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
    dollar_per_point DECIMAL(10, 2) NOT NULL DEFAULT 0.01,
    min_points_redeem INT NOT NULL DEFAULT 100,
    max_points_per_order INT,
    signup_bonus INT NOT NULL DEFAULT 0,
    birthday_bonus INT NOT NULL DEFAULT 0,
    referral_bonus INT NOT NULL DEFAULT 0,
    points_expire_days INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_store_active (store_id, is_active),
    INDEX idx_dates (start_date, end_date)
);
```

#### DTOs Required

```java
// CreateProgramRequest.java
public class CreateProgramRequest {
    @NotNull
    private Long storeId;

    @NotBlank
    @Size(max = 100)
    private String name;

    private String description;

    @DecimalMin("0.0")
    private BigDecimal pointsPerDollar = BigDecimal.ONE;

    @DecimalMin("0.0")
    private BigDecimal dollarPerPoint = new BigDecimal("0.01");

    @Min(0)
    private Integer minPointsRedeem = 100;

    private Integer maxPointsPerOrder;

    @Min(0)
    private Integer signupBonus = 0;

    @Min(0)
    private Integer birthdayBonus = 0;

    @Min(0)
    private Integer referralBonus = 0;

    private Integer pointsExpireDays;

    @NotNull
    private LocalDateTime startDate;

    @Future
    private LocalDateTime endDate;

    // Getters/Setters
}

// UpdateProgramRequest.java
public class UpdateProgramRequest {
    // Same fields as CreateProgramRequest but all optional
}
```

#### Entity Model

```java
@Entity
@Table(name = "loyalty_programs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyProgram {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "points_per_dollar", nullable = false)
    private BigDecimal pointsPerDollar;

    @Column(name = "dollar_per_point", nullable = false)
    private BigDecimal dollarPerPoint;

    @Column(name = "min_points_redeem", nullable = false)
    private Integer minPointsRedeem;

    @Column(name = "max_points_per_order")
    private Integer maxPointsPerOrder;

    @Column(name = "signup_bonus", nullable = false)
    private Integer signupBonus;

    @Column(name = "birthday_bonus", nullable = false)
    private Integer birthdayBonus;

    @Column(name = "referral_bonus", nullable = false)
    private Integer referralBonus;

    @Column(name = "points_expire_days")
    private Integer pointsExpireDays;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL)
    private List<LoyaltyTier> tiers;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL)
    private List<LoyaltyCampaign> campaigns;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Acceptance Criteria

- [ ] Can create loyalty program via POST `/api/loyalty/programs`
- [ ] Can list all programs via GET `/api/loyalty/programs`
- [ ] Can get specific program via GET `/api/loyalty/programs/{id}`
- [ ] Can update program via PUT `/api/loyalty/programs/{id}`
- [ ] Can soft delete program via DELETE `/api/loyalty/programs/{id}`
- [ ] Can filter active programs via GET `/api/loyalty/programs/active`
- [ ] Program validation prevents invalid dates (end before start)
- [ ] Program validation prevents invalid point ratios
- [ ] Returns proper HTTP status codes (200, 201, 404, 400)
- [ ] All DTOs properly validated with Bean Validation
- [ ] Database migrations created (Flyway/Liquibase)
- [ ] Unit tests for service layer (80%+ coverage)
- [ ] Integration tests for controller endpoints
- [ ] API documentation updated (Swagger/OpenAPI)

### Testing Requirements

```java
@SpringBootTest
@AutoConfigureMockMvc
class LoyaltyProgramControllerIntegrationTest {

    @Test
    void shouldCreateProgram() {
        // Given: Valid program data
        // When: POST /api/loyalty/programs
        // Then: Returns 201 with created program
    }

    @Test
    void shouldListPrograms() {
        // Given: Multiple programs exist
        // When: GET /api/loyalty/programs
        // Then: Returns 200 with all programs
    }

    @Test
    void shouldUpdateProgram() {
        // Given: Existing program
        // When: PUT /api/loyalty/programs/{id}
        // Then: Returns 200 with updated program
    }

    @Test
    void shouldNotCreateProgramWithEndBeforeStart() {
        // Given: Invalid dates
        // When: POST /api/loyalty/programs
        // Then: Returns 400 Bad Request
    }
}
```

### Frontend Integration

Once implemented, frontend will automatically work:

```typescript
// Already implemented in frontend/admin-pos/src/services/api-spring.ts
const programs = await loyaltyApi.getPrograms()
const program = await loyaltyApi.createProgram({
  storeId: 1,
  name: "Gold Member Program",
  pointsPerDollar: 1,
  minPointsRedeem: 100,
  startDate: "2025-01-01T00:00:00"
})
```

Console warnings will disappear when endpoints are available.

### Related Files

**Frontend (Already Done):**
- `frontend/admin-pos/src/services/api-spring.ts` - API client
- `frontend/admin-pos/src/services/loyalty.ts` - Service layer
- `frontend/admin-pos/src/stores/loyalty.ts` - State management
- `frontend/admin-pos/src/components/loyalty/ProgramCard.vue` - UI

**Backend (To Create):**
- `operations-service/controller/LoyaltyProgramController.java`
- `operations-service/service/LoyaltyProgramService.java`
- `operations-service/repository/LoyaltyProgramRepository.java`
- `operations-service/model/LoyaltyProgram.java`
- `operations-service/dto/CreateProgramRequest.java`
- `operations-service/dto/UpdateProgramRequest.java`
- `operations-service/resources/db/migration/V2__create_loyalty_programs.sql`

### Dependencies

- JPA/Hibernate (already configured)
- Bean Validation (already configured)
- Database migrations tool (Flyway or Liquibase)

### Notes

- Coordinate with Ticket #2 (Tiers) as they're related
- Consider adding program analytics in future
- May need to add program_id to loyalty_members table

---

## Ticket #2: Implement Loyalty Tiers Management with Auto-Upgrade

**Type:** Feature
**Priority:** High
**Component:** operations-service
**Estimated Effort:** 8-10 hours
**Labels:** `backend`, `loyalty`, `enhancement`, `business-logic`

### Description

Implement loyalty tier system with automatic tier upgrades based on member spend and visit count. Tiers provide different benefits (point multipliers, discounts, perks) and members should automatically upgrade when they meet criteria.

### Current State

**Database:**
- `loyalty_members` table has `tier` column (VARCHAR) but no tier table
- No tier management system
- No auto-upgrade logic

**Frontend Status:**
- ✅ Tier UI components ready
- ✅ API client implemented
- ⚠️ Tiers shown as plain strings, not rich objects

### Requirements

#### Functional Requirements

1. **Tier CRUD** - Manage tier definitions per program
2. **Auto-Upgrade Logic** - Automatically upgrade members when criteria met
3. **Tier Benefits** - Define multipliers, discounts, and perks per tier
4. **Tier Progression** - Track member progress toward next tier
5. **Tier History** - Log all tier changes for a member
6. **Downgrade Support** - Optional tier downgrade after inactivity

#### API Endpoints to Implement

```java
// LoyaltyTierController.java
@RestController
@RequestMapping("/api/loyalty/tiers")
public class LoyaltyTierController {

    @GetMapping("/program/{programId}")
    public List<LoyaltyTier> getProgramTiers(@PathVariable Long programId) {
        // Return all tiers for a program, ordered by sort_order
    }

    @GetMapping("/{tierId}")
    public LoyaltyTier getTier(@PathVariable Long tierId) {
        // Return specific tier details
    }

    @PostMapping("/program/{programId}")
    @ResponseStatus(HttpStatus.CREATED)
    public LoyaltyTier createTier(
        @PathVariable Long programId,
        @Valid @RequestBody CreateTierRequest request
    ) {
        // Create new tier for program
    }

    @PutMapping("/{tierId}")
    public LoyaltyTier updateTier(
        @PathVariable Long tierId,
        @Valid @RequestBody UpdateTierRequest request
    ) {
        // Update tier settings
    }

    @DeleteMapping("/{tierId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTier(@PathVariable Long tierId) {
        // Delete tier (check no members currently in this tier)
    }

    @GetMapping("/member/{memberId}/progress")
    public TierProgressResponse getMemberTierProgress(@PathVariable Long memberId) {
        // Return member's current tier and progress to next
    }
}
```

#### Database Schema

```sql
CREATE TABLE loyalty_tiers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(7),  -- Hex color for UI
    icon VARCHAR(50),
    min_spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
    min_visits INT NOT NULL DEFAULT 0,
    points_multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
    discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
    free_delivery BOOLEAN NOT NULL DEFAULT FALSE,
    priority_support BOOLEAN NOT NULL DEFAULT FALSE,
    birthday_reward INT NOT NULL DEFAULT 0,
    benefits TEXT,  -- JSON array of benefits
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    INDEX idx_program_order (program_id, sort_order),
    INDEX idx_criteria (min_spent, min_visits)
);

CREATE TABLE loyalty_tier_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    from_tier_id BIGINT,
    to_tier_id BIGINT NOT NULL,
    reason VARCHAR(100),  -- 'UPGRADE', 'DOWNGRADE', 'MANUAL'
    triggered_by VARCHAR(50),  -- 'SYSTEM', 'ADMIN', 'TRANSACTION'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES loyalty_members(id) ON DELETE CASCADE,
    FOREIGN KEY (from_tier_id) REFERENCES loyalty_tiers(id) ON DELETE SET NULL,
    FOREIGN KEY (to_tier_id) REFERENCES loyalty_tiers(id) ON DELETE CASCADE,
    INDEX idx_member_date (member_id, created_at DESC)
);
```

#### Auto-Upgrade Logic

```java
@Service
@Slf4j
public class LoyaltyTierService {

    private final LoyaltyMemberRepository memberRepository;
    private final LoyaltyTierRepository tierRepository;
    private final LoyaltyTierHistoryRepository tierHistoryRepository;

    /**
     * Check and upgrade member tier if eligible
     * Called after every transaction or spend update
     */
    @Transactional
    public LoyaltyMember checkAndUpgradeTier(Long memberId) {
        LoyaltyMember member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        // Get current tier
        LoyaltyTier currentTier = member.getTier();

        // Get member stats
        BigDecimal totalSpent = calculateMemberSpend(memberId);
        Integer visitCount = calculateMemberVisits(memberId);

        // Find highest eligible tier
        List<LoyaltyTier> programTiers = tierRepository
            .findByProgramIdOrderBySortOrderAsc(member.getProgramId());

        LoyaltyTier eligibleTier = null;
        for (LoyaltyTier tier : programTiers) {
            if (totalSpent.compareTo(tier.getMinSpent()) >= 0
                && visitCount >= tier.getMinVisits()) {
                eligibleTier = tier;
            }
        }

        // Upgrade if eligible for higher tier
        if (eligibleTier != null && !eligibleTier.equals(currentTier)) {
            log.info("Upgrading member {} from {} to {}",
                memberId, currentTier.getName(), eligibleTier.getName());

            // Update member tier
            member.setTier(eligibleTier);
            memberRepository.save(member);

            // Record tier change
            LoyaltyTierHistory history = LoyaltyTierHistory.builder()
                .memberId(memberId)
                .fromTierId(currentTier != null ? currentTier.getId() : null)
                .toTierId(eligibleTier.getId())
                .reason("UPGRADE")
                .triggeredBy("SYSTEM")
                .build();
            tierHistoryRepository.save(history);

            // TODO: Send notification to member about upgrade
        }

        return member;
    }

    /**
     * Calculate tier progress for member
     */
    public TierProgressResponse calculateTierProgress(Long memberId) {
        LoyaltyMember member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        LoyaltyTier currentTier = member.getTier();
        BigDecimal totalSpent = calculateMemberSpend(memberId);
        Integer visitCount = calculateMemberVisits(memberId);

        // Find next tier
        List<LoyaltyTier> programTiers = tierRepository
            .findByProgramIdOrderBySortOrderAsc(member.getProgramId());

        LoyaltyTier nextTier = null;
        for (LoyaltyTier tier : programTiers) {
            if (tier.getSortOrder() > currentTier.getSortOrder()) {
                nextTier = tier;
                break;
            }
        }

        if (nextTier == null) {
            // Already at highest tier
            return TierProgressResponse.builder()
                .currentTier(currentTier)
                .nextTier(null)
                .progress(100)
                .remainingSpend(BigDecimal.ZERO)
                .remainingVisits(0)
                .build();
        }

        // Calculate progress
        BigDecimal spendProgress = totalSpent.divide(nextTier.getMinSpent(), 2, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));
        int visitProgress = (visitCount * 100) / nextTier.getMinVisits();
        int overallProgress = Math.min(spendProgress.intValue(), visitProgress);

        return TierProgressResponse.builder()
            .currentTier(currentTier)
            .nextTier(nextTier)
            .progress(overallProgress)
            .remainingSpend(nextTier.getMinSpent().subtract(totalSpent))
            .remainingVisits(Math.max(0, nextTier.getMinVisits() - visitCount))
            .build();
    }

    private BigDecimal calculateMemberSpend(Long memberId) {
        // Query sum of all order totals for this member
        // Or get from member.totalSpent if tracked
        return memberRepository.findById(memberId)
            .map(LoyaltyMember::getTotalSpent)
            .orElse(BigDecimal.ZERO);
    }

    private Integer calculateMemberVisits(Long memberId) {
        // Query count of distinct orders for this member
        // Or get from member.visitCount if tracked
        return memberRepository.findById(memberId)
            .map(LoyaltyMember::getVisitCount)
            .orElse(0);
    }
}
```

#### Event Listener for Auto-Upgrade

```java
@Component
@Slf4j
public class LoyaltyEventListener {

    private final LoyaltyTierService tierService;

    /**
     * Automatically check tier upgrade after transaction
     */
    @EventListener
    @Async
    public void onTransactionCreated(LoyaltyTransactionCreatedEvent event) {
        log.info("Transaction created, checking tier eligibility for member: {}",
            event.getMemberId());
        tierService.checkAndUpgradeTier(event.getMemberId());
    }

    /**
     * Automatically check tier upgrade after order completion
     */
    @EventListener
    @Async
    public void onOrderCompleted(OrderCompletedEvent event) {
        if (event.getCustomerId() != null) {
            // Find loyalty member for this customer
            // Check tier upgrade
        }
    }
}
```

### Acceptance Criteria

- [ ] Can create tiers for a program
- [ ] Can list all tiers for a program
- [ ] Can update tier settings
- [ ] Can delete tier (with validation)
- [ ] Member automatically upgrades when criteria met
- [ ] Tier history is logged for all changes
- [ ] Can retrieve member tier progress
- [ ] Point multiplier applies to new transactions
- [ ] Discount applies when member redeems
- [ ] Free delivery flag accessible for order processing
- [ ] Tier benefits returned as structured data
- [ ] Validation prevents deleting tier with active members
- [ ] Validation ensures sort_order is unique per program
- [ ] Integration tests verify auto-upgrade logic
- [ ] Event listeners properly trigger tier checks

### Testing Requirements

```java
@Test
void shouldAutoUpgradeMemberTier() {
    // Given: Member with $900 spent, Gold tier requires $1000
    // When: Member makes purchase bringing total to $1050
    // Then: Member automatically upgraded to Gold tier
    // And: Tier history entry created
}

@Test
void shouldCalculateTierProgress() {
    // Given: Member at Silver tier, Gold requires $1000 and 20 visits
    // And: Member has $750 spent and 15 visits
    // When: GET /api/loyalty/tiers/member/{id}/progress
    // Then: Returns 75% progress (whichever is lower)
    // And: Shows $250 remaining spend and 5 remaining visits
}

@Test
void shouldApplyPointsMultiplier() {
    // Given: Member in Gold tier with 1.5x multiplier
    // When: Transaction adds 100 base points
    // Then: Member receives 150 points
}
```

### Frontend Integration

```typescript
// Frontend already ready to consume
const tiers = await loyaltyApi.getProgramTiers(programId)
const progress = await loyaltyApi.getMemberTierProgress(memberId)

// Display progress bar
<TierProgressBar
  :current="progress.currentTier"
  :next="progress.nextTier"
  :percentage="progress.progress"
  :remainingSpend="progress.remainingSpend"
/>
```

### Related Files

**Backend (To Create):**
- `operations-service/controller/LoyaltyTierController.java`
- `operations-service/service/LoyaltyTierService.java`
- `operations-service/repository/LoyaltyTierRepository.java`
- `operations-service/repository/LoyaltyTierHistoryRepository.java`
- `operations-service/model/LoyaltyTier.java`
- `operations-service/model/LoyaltyTierHistory.java`
- `operations-service/event/LoyaltyEventListener.java`
- `operations-service/dto/TierProgressResponse.java`

### Dependencies

- Ticket #1 (Programs) must be completed first
- May need to update `loyalty_members` table to add tier foreign key

### Notes

- Consider notification service integration for tier upgrade alerts
- May want to add tier badges/icons in UI
- Consider tier downgrade policy (e.g., after 1 year inactivity)

---

## Ticket #3: Implement Loyalty Campaigns System

**Type:** Feature
**Priority:** Medium
**Component:** operations-service
**Estimated Effort:** 6-8 hours
**Labels:** `backend`, `loyalty`, `enhancement`, `marketing`

### Description

Implement loyalty campaigns for promotional point bonuses (double points days, category multipliers, spend threshold bonuses, etc.). Campaigns should automatically apply when conditions are met.

### Current State

**Database:**
- No campaigns table
- No campaign evaluation logic

**Frontend Status:**
- ✅ Campaign UI ready
- ✅ Campaign creation forms ready
- ⚠️ API returns empty arrays

### Requirements

#### Functional Requirements

1. **Campaign CRUD** - Create and manage campaigns
2. **Campaign Types:**
   - **DOUBLE_POINTS** - 2x points during campaign period
   - **BONUS_POINTS** - Fixed bonus points per transaction
   - **CATEGORY_MULTIPLIER** - Extra points for specific categories
   - **SPEND_THRESHOLD** - Bonus when spend exceeds threshold
3. **Auto-Application** - Campaigns apply automatically to qualifying transactions
4. **Usage Tracking** - Track how many times campaign used
5. **Max Redemptions** - Limit campaign usage
6. **Date-Based Activation** - Active only between start/end dates

#### API Endpoints

```java
@RestController
@RequestMapping("/api/loyalty/campaigns")
public class LoyaltyCampaignController {

    @GetMapping
    public List<LoyaltyCampaign> listCampaigns(
        @RequestParam(required = false) Long programId,
        @RequestParam(required = false) Boolean activeOnly
    ) {
        // List all campaigns, optionally filtered
    }

    @GetMapping("/{campaignId}")
    public LoyaltyCampaign getCampaign(@PathVariable Long campaignId) {
        // Get specific campaign
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LoyaltyCampaign createCampaign(@Valid @RequestBody CreateCampaignRequest request) {
        // Create new campaign
    }

    @PutMapping("/{campaignId}")
    public LoyaltyCampaign updateCampaign(
        @PathVariable Long campaignId,
        @Valid @RequestBody UpdateCampaignRequest request
    ) {
        // Update campaign
    }

    @DeleteMapping("/{campaignId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCampaign(@PathVariable Long campaignId) {
        // Delete campaign
    }

    @GetMapping("/active")
    public List<LoyaltyCampaign> getActiveCampaigns(
        @RequestParam(required = false) Long programId
    ) {
        // Get currently active campaigns
    }

    @PostMapping("/{campaignId}/evaluate")
    public CampaignEvaluationResponse evaluateCampaign(
        @PathVariable Long campaignId,
        @RequestBody CampaignEvaluationRequest request
    ) {
        // Evaluate if campaign applies to transaction
    }
}
```

#### Database Schema

```sql
CREATE TABLE loyalty_campaigns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL,  -- DOUBLE_POINTS, BONUS_POINTS, etc.
    points_bonus INT NOT NULL DEFAULT 0,
    multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
    min_spend DECIMAL(10, 2),
    category_id BIGINT,
    menu_item_id BIGINT,
    max_redemptions INT,
    usage_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    store_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    INDEX idx_active_dates (is_active, start_date, end_date),
    INDEX idx_program (program_id),
    INDEX idx_store (store_id)
);

CREATE TABLE loyalty_campaign_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    campaign_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    transaction_id BIGINT NOT NULL,
    points_awarded INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES loyalty_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES loyalty_members(id) ON DELETE CASCADE,
    INDEX idx_campaign_member (campaign_id, member_id),
    INDEX idx_member_date (member_id, created_at DESC)
);
```

#### Campaign Evaluation Logic

```java
@Service
@Slf4j
public class LoyaltyCampaignService {

    /**
     * Evaluate and apply applicable campaigns to a transaction
     */
    public List<AppliedCampaign> evaluateAndApplyCampaigns(
        Long memberId,
        Long transactionId,
        CampaignEvaluationContext context
    ) {
        // Get active campaigns
        LocalDateTime now = LocalDateTime.now();
        List<LoyaltyCampaign> activeCampaigns = campaignRepository
            .findActiveCampaigns(now, context.getStoreId());

        List<AppliedCampaign> appliedCampaigns = new ArrayList<>();

        for (LoyaltyCampaign campaign : activeCampaigns) {
            // Check if campaign applies
            if (isCampaignApplicable(campaign, context)) {
                // Calculate bonus points
                int bonusPoints = calculateCampaignBonus(campaign, context);

                if (bonusPoints > 0) {
                    // Apply campaign
                    applyCampaign(campaign, memberId, transactionId, bonusPoints);

                    appliedCampaigns.add(AppliedCampaign.builder()
                        .campaign(campaign)
                        .bonusPoints(bonusPoints)
                        .build());
                }
            }
        }

        return appliedCampaigns;
    }

    private boolean isCampaignApplicable(
        LoyaltyCampaign campaign,
        CampaignEvaluationContext context
    ) {
        // Check max redemptions
        if (campaign.getMaxRedemptions() != null
            && campaign.getUsageCount() >= campaign.getMaxRedemptions()) {
            return false;
        }

        // Check campaign type specific conditions
        switch (campaign.getCampaignType()) {
            case CATEGORY_MULTIPLIER:
                return context.getCategoryId() != null
                    && context.getCategoryId().equals(campaign.getCategoryId());

            case SPEND_THRESHOLD:
                return context.getTransactionAmount() != null
                    && context.getTransactionAmount().compareTo(campaign.getMinSpend()) >= 0;

            case DOUBLE_POINTS:
            case BONUS_POINTS:
                return true;  // Always applicable if active

            default:
                return false;
        }
    }

    private int calculateCampaignBonus(
        LoyaltyCampaign campaign,
        CampaignEvaluationContext context
    ) {
        switch (campaign.getCampaignType()) {
            case DOUBLE_POINTS:
                // Double the base points
                return context.getBasePoints();

            case BONUS_POINTS:
                return campaign.getPointsBonus();

            case CATEGORY_MULTIPLIER:
                // Apply multiplier to base points
                return (int) (context.getBasePoints() * (campaign.getMultiplier().doubleValue() - 1));

            case SPEND_THRESHOLD:
                return campaign.getPointsBonus();

            default:
                return 0;
        }
    }

    @Transactional
    private void applyCampaign(
        LoyaltyCampaign campaign,
        Long memberId,
        Long transactionId,
        int bonusPoints
    ) {
        // Increment usage count
        campaign.setUsageCount(campaign.getUsageCount() + 1);
        campaignRepository.save(campaign);

        // Record usage
        LoyaltyCampaignUsage usage = LoyaltyCampaignUsage.builder()
            .campaignId(campaign.getId())
            .memberId(memberId)
            .transactionId(transactionId)
            .pointsAwarded(bonusPoints)
            .build();
        campaignUsageRepository.save(usage);

        log.info("Applied campaign {} to member {}: {} bonus points",
            campaign.getName(), memberId, bonusPoints);
    }
}
```

### Acceptance Criteria

- [ ] Can create all campaign types
- [ ] Can list campaigns with filters
- [ ] Can update campaign settings
- [ ] Can delete campaigns
- [ ] DOUBLE_POINTS campaigns apply 2x multiplier
- [ ] BONUS_POINTS campaigns add fixed bonus
- [ ] CATEGORY_MULTIPLIER campaigns apply to specific categories
- [ ] SPEND_THRESHOLD campaigns activate above minimum spend
- [ ] Max redemptions limit enforced
- [ ] Usage count increments correctly
- [ ] Date range validation prevents invalid campaigns
- [ ] Campaign evaluation is performant (<100ms)
- [ ] Unit tests for all campaign types
- [ ] Integration tests verify campaign application

### Frontend Integration

```typescript
// Frontend ready
const campaigns = await loyaltyApi.getActiveCampaigns()
const newCampaign = await loyaltyApi.createCampaign({
  programId: 1,
  name: "Weekend Double Points",
  campaignType: "DOUBLE_POINTS",
  startDate: "2025-12-01T00:00:00",
  endDate: "2025-12-31T23:59:59"
})
```

### Related Files

**Backend (To Create):**
- `operations-service/controller/LoyaltyCampaignController.java`
- `operations-service/service/LoyaltyCampaignService.java`
- `operations-service/repository/LoyaltyCampaignRepository.java`
- `operations-service/model/LoyaltyCampaign.java`
- `operations-service/model/LoyaltyCampaignUsage.java`
- `operations-service/dto/CampaignEvaluationContext.java`

---

## Ticket #4: Implement Loyalty Analytics Endpoints

**Type:** Feature
**Priority:** Medium
**Component:** analytics-service
**Estimated Effort:** 4-6 hours
**Labels:** `backend`, `loyalty`, `analytics`, `reporting`

### Description

Implement analytics endpoints for loyalty program performance metrics. Frontend currently calculates metrics client-side by aggregating data from multiple API calls - inefficient and slow.

### Current State

**Frontend:**
- ✅ Analytics UI ready (charts, dashboards)
- ⚠️ Client-side aggregation (slow, inefficient)
- ⚠️ Multiple API calls to get data

**Backend:**
- ❌ No analytics endpoints

### Requirements

#### API Endpoints

```java
@RestController
@RequestMapping("/api/loyalty/analytics")
public class LoyaltyAnalyticsController {

    @GetMapping("/overview")
    public LoyaltyAnalyticsOverview getOverview(
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate,
        @RequestParam(required = false) Long programId
    ) {
        // Return overall loyalty metrics
    }

    @GetMapping("/customers")
    public CustomerAnalytics getCustomerAnalytics(
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate,
        @RequestParam(required = false) Long tierId
    ) {
        // Return customer segmentation data
    }

    @GetMapping("/redemptions")
    public RedemptionAnalytics getRedemptionAnalytics(
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate,
        @RequestParam(required = false) Long programId
    ) {
        // Return redemption metrics
    }

    @GetMapping("/campaigns/performance")
    public List<CampaignPerformance> getCampaignPerformance(
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate
    ) {
        // Return campaign performance metrics
    }

    @GetMapping("/trends")
    public LoyaltyTrends getTrends(
        @RequestParam String period  // DAILY, WEEKLY, MONTHLY
    ) {
        // Return loyalty trends over time
    }
}
```

#### DTOs

```java
@Data
@Builder
public class LoyaltyAnalyticsOverview {
    private Integer enrolledCustomers;
    private Long pointsIssued;
    private Long pointsRedeemed;
    private BigDecimal redemptionValue;
    private Long pointsOutstanding;
    private BigDecimal enrollmentRate;
    private BigDecimal redemptionRate;
    private Map<String, Integer> membersByTier;
    private List<TopMember> topMembers;
}

@Data
@Builder
public class CustomerAnalytics {
    private Integer totalMembers;
    private Integer activeMembers;
    private Integer newMembersThisPeriod;
    private Integer churnedMembers;
    private BigDecimal averagePointsPerMember;
    private BigDecimal averageSpendPerMember;
    private Map<String, Integer> membersByTier;
    private List<TierDistribution> tierDistribution;
}

@Data
@Builder
public class CampaignPerformance {
    private Long campaignId;
    private String campaignName;
    private Long pointsIssued;
    private Integer participations;
    private Integer uniqueMembers;
    private BigDecimal conversionRate;
    private BigDecimal roi;  // If cost data available
}
```

### Acceptance Criteria

- [ ] Overview endpoint returns summary metrics
- [ ] Customer analytics provides segmentation data
- [ ] Redemption analytics tracks redemption patterns
- [ ] Campaign performance shows ROI metrics
- [ ] Trends endpoint supports DAILY/WEEKLY/MONTHLY
- [ ] Date filtering works correctly
- [ ] Query performance <500ms for large datasets
- [ ] Results properly cached (consider Redis)
- [ ] Integration tests verify calculations
- [ ] API documentation complete

### Frontend Integration

```typescript
// Replaces multiple API calls with one
const analytics = await loyaltyApi.getAnalyticsOverview({
  startDate: '2025-01-01',
  endDate: '2025-12-31'
})
```

---

## Ticket #5: Implement Order-Loyalty Integration

**Type:** Feature
**Priority:** High
**Component:** operations-service + order-service
**Estimated Effort:** 4-5 hours
**Labels:** `backend`, `loyalty`, `integration`, `events`

### Description

Automatically award loyalty points when orders are completed and allow redemption application to orders. Currently, points must be manually awarded.

### Requirements

#### Auto-Point Accrual

```java
@Component
@Slf4j
public class OrderEventListener {

    private final LoyaltyService loyaltyService;

    @EventListener
    @Async
    public void onOrderCompleted(OrderCompletedEvent event) {
        if (event.getCustomerId() == null) {
            return;  // Guest order, no loyalty
        }

        // Find loyalty member
        Optional<LoyaltyMember> member = loyaltyService
            .findMemberByUserId(event.getCustomerId());

        if (member.isEmpty()) {
            log.debug("No loyalty member for customer {}", event.getCustomerId());
            return;
        }

        // Calculate points
        int points = loyaltyService.calculatePointsForOrder(
            member.get().getProgramId(),
            event.getOrderTotal()
        );

        // Award points
        loyaltyService.awardPoints(
            member.get().getId(),
            points,
            "Order #" + event.getOrderNumber(),
            event.getOrderId()
        );

        log.info("Awarded {} points to member {} for order {}",
            points, member.get().getId(), event.getOrderNumber());
    }
}
```

#### Redemption Application

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @PostMapping("/{orderId}/apply-loyalty-discount")
    public Order applyLoyaltyDiscount(
        @PathVariable Long orderId,
        @RequestBody ApplyLoyaltyDiscountRequest request
    ) {
        // Validate redemption
        LoyaltyRedemption redemption = loyaltyService
            .validateRedemption(request.getRedemptionId(), request.getMemberId());

        // Calculate discount
        BigDecimal discount = loyaltyService
            .calculateRedemptionValue(redemption);

        // Apply to order
        Order order = orderService.applyDiscount(orderId, discount,
            "Loyalty: " + redemption.getDescription());

        // Mark redemption as applied
        loyaltyService.markRedemptionApplied(redemption.getId(), orderId);

        return order;
    }
}
```

### Acceptance Criteria

- [ ] Points automatically awarded on order completion
- [ ] Points calculation respects program settings
- [ ] Campaign bonuses apply automatically
- [ ] Tier multipliers apply to points calculation
- [ ] Redemptions can be applied to orders
- [ ] Redemption value calculated correctly
- [ ] Order total updated when discount applied
- [ ] Event listeners are async and non-blocking
- [ ] Integration tests verify end-to-end flow
- [ ] Rollback handling for failed transactions

---

## 📊 Implementation Priority

**Recommended Order:**

1. **Ticket #1 - Programs** (Required for tiers)
2. **Ticket #2 - Tiers** (Depends on programs)
3. **Ticket #5 - Order Integration** (High business value)
4. **Ticket #3 - Campaigns** (Marketing features)
5. **Ticket #4 - Analytics** (Reporting features)

**Total Estimated Effort:** 28-37 hours

---

## 🧪 Testing Strategy

### Integration Test Scenario

```java
@SpringBootTest
@Transactional
class LoyaltyIntegrationTest {

    @Test
    void fullLoyaltyFlow() {
        // 1. Create program with tiers
        LoyaltyProgram program = createProgram();
        LoyaltyTier bronze = createTier(program, "Bronze", 0, 1.0);
        LoyaltyTier silver = createTier(program, "Silver", 1000, 1.5);

        // 2. Enroll member
        LoyaltyMember member = enrollMember(userId, program);
        assertEquals(bronze, member.getTier());

        // 3. Create campaign
        LoyaltyCampaign campaign = createDoublePointsCampaign(program);

        // 4. Complete order
        Order order = completeOrder(userId, 550.00);

        // 5. Verify points awarded (campaign bonus + tier multiplier)
        member = getMember(member.getId());
        assertEquals(550, member.getPointsBalance());  // 550 base points

        // 6. Complete another order to trigger tier upgrade
        Order order2 = completeOrder(userId, 550.00);

        // 7. Verify tier upgrade
        member = getMember(member.getId());
        assertEquals(silver, member.getTier());

        // 8. Redeem points
        LoyaltyRedemption redemption = redeemPoints(member.getId(), 200);

        // 9. Apply to order
        Order order3 = createOrder(userId, 100.00);
        order3 = applyRedemption(order3.getId(), redemption.getId());

        // 10. Verify discount applied
        assertTrue(order3.getTotal().compareTo(new BigDecimal("98.00")) == 0);
    }
}
```

---

## 📝 Documentation Requirements

For each ticket, create:
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database migration scripts
- [ ] Service layer Javadoc
- [ ] Integration test examples
- [ ] Postman collection examples

---

## ✅ Definition of Done

Each ticket is complete when:
- [ ] All endpoints implemented and tested
- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests pass
- [ ] API documentation updated
- [ ] Database migrations created
- [ ] Code reviewed and approved
- [ ] Frontend integration verified
- [ ] Performance tested (load testing if applicable)
- [ ] Security reviewed (authorization checks)
- [ ] Deployed to dev/staging environment

---

**Created:** November 16, 2025
**Last Updated:** November 16, 2025
**Related:** MIGRATION_COMPLETION_SUMMARY.md, API_MISMATCH_REPORT.md
