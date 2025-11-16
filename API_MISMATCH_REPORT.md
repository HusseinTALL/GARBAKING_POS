# API Mismatch Report - Frontend vs Backend
**Generated:** November 16, 2025
**Status:** Analysis Complete

## Executive Summary

The Admin POS frontend has been partially migrated from the legacy Node.js backend to the Spring Boot microservices backend. However, there are significant endpoint mismatches between what the frontend expects and what the backend actually provides.

### Overall Status
- ✅ **Good:** All services now use `api-spring.ts` (no legacy `api.ts` imports)
- ⚠️ **Issue:** Many endpoints in `api-spring.ts` don't match actual Spring Boot backend routes
- ❌ **Blocker:** Type definitions use string IDs but Spring Boot returns numeric IDs (Long)

---

## Detailed Mismatches

### 1. Loyalty Service 🔴 CRITICAL

**Frontend Endpoints (api-spring.ts):**
```
GET  /api/loyalty/programs
POST /api/loyalty/programs
PUT  /api/loyalty/programs/{programId}
DEL  /api/loyalty/programs/{programId}
GET  /api/loyalty/programs/{programId}/tiers
POST /api/loyalty/customer/{customerId}/join
GET  /api/loyalty/customers
GET  /api/loyalty/customers/{customerId}
GET  /api/loyalty/customer/{customerId}/rewards
GET  /api/loyalty/customer/{customerId}/redemptions
POST /api/loyalty/customer/{customerId}/redeem
```

**Backend Endpoints (operations-service/LoyaltyController.java):**
```
POST /api/loyalty/members
GET  /api/loyalty/members
GET  /api/loyalty/members/{memberId}
PUT  /api/loyalty/members/{memberId}
POST /api/loyalty/members/{memberId}/transactions
GET  /api/loyalty/members/{memberId}/transactions
POST /api/loyalty/members/{memberId}/rewards/redeem
```

**Mismatches:**
- ❌ Backend has no `/programs` endpoints - frontend expects programs, backend only has members
- ❌ Backend uses `/members` not `/customers`
- ❌ Backend uses `/transactions` not `/rewards` and `/redemptions`
- ❌ Backend uses numeric `memberId` (Long) but frontend uses string `customerId`
- ❌ No tier management endpoints in backend
- ❌ No enrollment endpoint (`/join`) in backend - only member creation
- ❌ No analytics endpoints in backend

**Impact:** Loyalty features completely non-functional

---

### 2. Upload Service ✅ MOSTLY WORKING

**Frontend Endpoints (uploadApi in api-spring.ts):**
```
POST /api/menu-items/{menuItemId}/images
GET  /api/menu-items/{menuItemId}  (to fetch images)
DEL  /api/menu-items/{menuItemId}/images/{imageId}
POST /api/upload/image  (legacy fallback)
```

**Backend Endpoints (inventory-service):**
```
POST /api/menu-items/{id}/images
GET  /api/menu-items/{id}/images
DEL  /api/menu-items/{id}/images/{imageId}
```

**Mismatches:**
- ⚠️ Frontend fetches from `/api/menu-items/{id}` (full item) instead of `/api/menu-items/{id}/images`
- ❌ Legacy endpoint `/api/upload/image` doesn't exist in Spring Boot
- ⚠️ Type mismatch: `menuItemId` as string vs numeric ID

**Impact:** Upload works but inefficient (fetches entire menu item instead of just images)

---

### 3. Kitchen/Orders Service 🟡 PARTIAL

**Frontend Expectations (stores/kitchen.ts):**
- Uses `ordersApi.getAll()` with query params
- Expects `orderItems` to include full `menuItem` objects
- Uses WebSocket at `ws://localhost:8082/ws/orders` (direct to order-service)

**Backend Endpoints (order-service):**
```
GET  /api/orders
GET  /api/orders/active
GET  /api/orders/{id}
GET  /api/orders/status/{status}
PUT  /api/orders/{id}/status
```

**Mismatches:**
- ✅ Basic CRUD endpoints match
- ⚠️ WebSocket connects directly to order-service (port 8082) bypassing API Gateway
- ⚠️ Query param support may vary (backend may not support all filter options)
- ⚠️ ID type mismatch (string vs Long)

**Impact:** Basic functionality works, but advanced filtering may fail

---

### 4. Tables & Floor Plans ❌ NOT IMPLEMENTED

**Frontend Endpoints (api-spring.ts):**
```
GET  /api/tables
POST /api/tables
GET  /api/tables/{id}
PUT  /api/tables/{id}
DEL  /api/tables/{id}
GET  /api/floor-plans
POST /api/floor-plans
```

**Backend Status:**
- ❌ Operations-service may have partial table management
- ❌ No floor plan endpoints found
- ❌ Reservation endpoints not verified

**Impact:** Table management non-functional

---

### 5. Payments & Receipts ⚠️ PARTIAL

**Frontend Endpoints (api-spring.ts):**
```
POST /api/payment/process
POST /api/payment/charge
POST /api/payment/refund
GET  /api/payment/methods
POST /api/payment/cash-drawer/open
POST /api/payment/cash-drawer/close
GET  /api/receipts/templates
POST /api/receipts/print
```

**Backend Status:**
- ⚠️ Operations-service has payment endpoints but structure unclear
- ❌ Receipt endpoints not verified
- ❌ Cash drawer endpoints not verified

**Impact:** Payments may work partially, receipts unclear

---

### 6. Analytics ⚠️ CLIENT-SIDE AGGREGATION

**Frontend Approach (stores/analytics.ts):**
- Currently synthesizes metrics client-side
- Fans out to orders and inventory services
- Calculates dashboardStats, sales data locally

**Backend Endpoints (analytics-service - if exists):**
```
GET /api/analytics/dashboard
GET /api/analytics/sales
GET /api/analytics/products
GET /api/analytics/categories
```

**Mismatches:**
- ⚠️ Frontend doesn't use backend analytics endpoints
- ⚠️ DTOs from backend (DashboardAnalytics, SalesData) not consumed
- ⚠️ Inefficient: multiple API calls instead of one analytics call

**Impact:** Works but inefficient and slow

---

## Type Definition Issues

### ID Type Mismatches

**Frontend (TypeScript):**
```typescript
interface LoyaltyCustomer {
  id: string  // ❌
  ...
}

interface PaymentMethod {
  id: string  // ❌
  ...
}
```

**Backend (Java):**
```java
public class LoyaltyMember {
  private Long id;  // ✅ Numeric
  ...
}

public class PaymentMethod {
  private Long id;  // ✅ Numeric
  ...
}
```

**Impact:**
- Runtime errors when backend returns `{"id": 123}` but frontend expects `{"id": "123"}`
- Comparison failures (`member.id === customerId` fails)
- Database query issues

**Affected Types:**
- LoyaltyCustomer/LoyaltyMember
- LoyaltyTier
- LoyaltyProgram
- LoyaltyCampaign
- LoyaltyReward
- LoyaltyRedemption
- PaymentMethod
- Table
- FloorSection
- All entity IDs

---

## API Client Response Handling

### Current Approach (api-spring.ts):
```typescript
// Good - handles various response formats
const mapOrderDtoToKitchenOrder = (order: any): KitchenOrder => {
  // Normalizes numeric/string IDs
  const id = normalizeString(order?.id ?? order?.orderId)
  ...
}
```

### Issue:
- ✅ Response mapping exists for kitchen orders
- ❌ No mapping for loyalty responses
- ❌ No mapping for payment responses
- ❌ No consistent ID normalization across all services

---

## Configuration Issues

### Environment Variables (frontend/.env):
```bash
VITE_API_GATEWAY_URL=http://localhost:8080  # ✅ Correct
```

### Hardcoded URLs:
- ⚠️ WebSocket: `ws://localhost:8082/ws/orders` (hardcoded, bypasses gateway)
- ⚠️ Some components may have hardcoded localhost URLs

---

## Recommendations

### Priority 1: Loyalty Service 🔴
**Action:** Align frontend with backend `/members` endpoints
1. Update `loyaltyApi` in `api-spring.ts`:
   - Change all `/customers/` → `/members/`
   - Change all `/customer/` → `/members/`
   - Remove `/programs` endpoints (or add to backend)
   - Update parameter names: `customerId` → `memberId`
2. Update `services/loyalty.ts` to use new endpoints
3. Update TypeScript types: `id: string` → `id: number`
4. Add ID normalization in response handlers

### Priority 2: Type Harmonization 🟡
**Action:** Add ID conversion layer
1. Create utility functions:
   ```typescript
   const toNumericId = (id: string | number): number => Number(id)
   const toStringId = (id: string | number): string => String(id)
   ```
2. Update all type definitions to use `number` for IDs
3. Add adapters in `api-spring.ts` to normalize responses

### Priority 3: Analytics Integration 🟡
**Action:** Use backend analytics endpoints
1. Replace client-side aggregation with `/api/analytics/*` calls
2. Map backend DTOs to frontend types
3. Remove redundant API calls

### Priority 4: Upload Optimization ⚠️
**Action:** Fetch only images, not full menu item
1. Change `fetchMenuItemImages` to use `/api/menu-items/{id}/images`
2. Add error handling for missing endpoints

### Priority 5: Configuration Standardization ⚠️
**Action:** Centralize all URLs
1. Move WebSocket URL to env var: `VITE_WS_URL`
2. Remove all hardcoded localhost references
3. Document required `.env` keys

### Priority 6: Missing Backend Features ❌
**Action:** Track and implement
1. Create backend stories for:
   - Loyalty programs management
   - Loyalty tier management
   - Floor plan management
   - Receipt template management
2. Add to backend backlog

---

## Migration Checklist

### Phase 1: Critical Fixes (Week 1)
- [ ] Fix loyalty endpoint mappings
- [ ] Update loyalty TypeScript types (string → number IDs)
- [ ] Test loyalty features with real backend

### Phase 2: Type Harmonization (Week 1-2)
- [ ] Create ID normalization utilities
- [ ] Update all type definitions
- [ ] Add response mappers for all services
- [ ] Add unit tests for mappers

### Phase 3: Optimization (Week 2)
- [ ] Integrate analytics endpoints
- [ ] Optimize upload service
- [ ] Centralize configuration
- [ ] Document API contracts

### Phase 4: Testing & Validation (Week 3)
- [ ] Add integration tests
- [ ] Test all critical flows
- [ ] Performance testing
- [ ] Error handling validation

---

## Files Requiring Changes

### Frontend Files:
1. **`frontend/admin-pos/src/services/api-spring.ts`**
   - Update `loyaltyApi` endpoints
   - Add response mappers for all DTOs
   - Add ID normalization

2. **`frontend/admin-pos/src/services/loyalty.ts`**
   - Update to handle new endpoint responses
   - Add error handling for missing features

3. **`frontend/admin-pos/src/services/uploadService.ts`**
   - Optimize image fetching
   - Remove legacy endpoint fallback

4. **`frontend/admin-pos/src/types/*.ts`** (all type files)
   - Change `id: string` → `id: number` for all entity types

5. **`frontend/admin-pos/src/stores/*.ts`** (affected stores)
   - Update to handle numeric IDs
   - Update API call parameters

6. **`frontend/admin-pos/.env`**
   - Add `VITE_WS_URL`
   - Add `VITE_ASSETS_URL`
   - Document all required vars

### Backend Files (if needed):
1. **`operations-service/controller/LoyaltyController.java`**
   - Consider adding program management endpoints
   - Consider adding customer search endpoint

2. **`inventory-service/controller/MenuItemController.java`**
   - Add `/api/menu-items/{id}/images` GET endpoint (if missing)

---

## Testing Strategy

### Unit Tests:
```typescript
describe('loyaltyApi', () => {
  it('should convert string member ID to number', () => {
    const result = loyaltyApi.normalizeId('123')
    expect(result).toBe(123)
  })

  it('should handle backend numeric ID response', () => {
    const backendResponse = { id: 456, name: 'John' }
    const mapped = mapLoyaltyMemberDto(backendResponse)
    expect(mapped.id).toBe('456') // or number, depending on decision
  })
})
```

### Integration Tests:
1. Test loyalty member creation
2. Test points accrual
3. Test reward redemption
4. Test image upload
5. Test order placement with loyalty

---

## Summary

**Current State:**
- Code structure good (using api-spring.ts)
- Endpoint mappings incorrect
- Type definitions mismatched
- Some features non-functional

**Next Steps:**
1. Fix loyalty endpoints (Priority 1)
2. Harmonize ID types (Priority 2)
3. Integrate analytics (Priority 3)
4. Test and validate

**Estimated Effort:**
- Priority 1: 4-6 hours
- Priority 2: 3-4 hours
- Priority 3: 2-3 hours
- Testing: 2-3 hours
- **Total: ~12-16 hours**

---

**Report End**
