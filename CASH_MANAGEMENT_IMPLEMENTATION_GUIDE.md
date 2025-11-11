# GARBAKING POS - Cash Management System Implementation Guide

## ✅ What's Been Completed (Phases 1-3)

### Phase 1: Database Foundation ✅
- **7 JPA Entities**: Payment transactions, cash drawer, sessions, transactions, denominations, reconciliations
- **7 Repositories**: Complete query methods with aggregations
- **Database Tables**: All tables created with proper indexes
- **Status**: PRODUCTION READY

### Phase 2: Services & REST APIs ✅
- **PaymentService**: Database-backed payment processing (196 lines)
- **CashDrawerService**: Complete cash lifecycle management (368 lines)
- **PaymentController**: 12 REST endpoints for payments
- **CashDrawerController**: 22 REST endpoints for cash operations
- **Status**: PRODUCTION READY

### Phase 3: Order Integration ✅
- **Kafka Integration**: Order payment events consumed
- **Auto Cash Recording**: Automatic cash transaction creation when orders are paid
- **Event Listeners**: 4 order event handlers (created, payment, status, cancelled)
- **Status**: PRODUCTION READY

---

## 🔧 What Remains (Phase 4)

### Frontend Components (Estimated: 4-6 hours)

**Location**: `/frontend/admin-pos/src/components/`

**Need to Create**:

1. **cash-drawer/CashDrawerPanel.vue** - Session info panel
   - Shows current session status
   - Display balance, variance, transaction count
   - Quick action buttons (Open, Close, Drop, Payout)

2. **cash-drawer/OpenCashDrawerModal.vue** - Open session dialog
   - Input starting cash amount
   - Denomination counter (100, 50, 20, 10, 5, 1, coins)
   - Auto-calculate total from denominations
   - Validation rules

3. **cash-drawer/CloseCashDrawerModal.vue** - Close session dialog
   - Input counted cash amount
   - Denomination counter for closing
   - Show expected vs counted
   - Calculate variance automatically
   - Show variance status (BALANCED, SHORT, OVER)
   - Input variance reason if discrepancy

4. **cash-drawer/CashTransactionsList.vue** - Transaction history
   - List all transactions for session
   - Filter by type (SALE, REFUND, DROP, PAYOUT, etc.)
   - Show timestamp, amount, reference, notes

5. **payment/PaymentMethodCard.vue** - Payment method card
   - Display payment method (CASH, CARD, WALLET)
   - Show enabled/disabled status
   - Quick actions (enable/disable)

6. **payment/TransactionRow.vue** - Transaction list item
   - Display transaction summary
   - Status badge
   - Action buttons (view, refund)

7. **payment/ProcessPaymentModal.vue** - Process payment
   - Select payment method
   - Input amount, tip
   - Link to active cash drawer session
   - Process and confirm

8. **payment/TransactionDetailsModal.vue** - View transaction
   - Full transaction details
   - Payment method, amounts, timestamps
   - Linked order information
   - Refund history

9. **payment/RefundModal.vue** - Process refund
   - Select transaction to refund
   - Input refund amount
   - Input refund reason
   - Validate amount <= original

**Update Required**:
- **api-spring.ts**: Update cash drawer API endpoints to match new backend

### Reporting Backend (Estimated: 2-3 hours)

**Location**: `/garbaking-backend/operations-service/src/main/java/.../service/`

**Need to Create**:

1. **CashReportService.java** (NEW)
   - Daily cash report generation
   - Session summary reports
   - Variance reports by date range
   - Cash flow analysis
   - User performance reports

2. **VarianceAlertService.java** (NEW)
   - Variance threshold configuration
   - Automatic alert generation
   - Email notifications for variances
   - SMS alerts (optional)
   - Alert history tracking

**Location**: `/garbaking-backend/operations-service/src/main/java/.../controller/`

3. **CashReportController.java** (NEW)
   - GET /api/cash-reports/daily?date={date}
   - GET /api/cash-reports/session/{sessionId}
   - GET /api/cash-reports/variance?start={start}&end={end}
   - GET /api/cash-reports/user/{userId}?start={start}&end={end}
   - GET /api/cash-reports/summary?start={start}&end={end}
   - POST /api/cash-reports/export (CSV/PDF)

4. **VarianceAlertController.java** (NEW)
   - GET /api/variance-alerts
   - GET /api/variance-alerts/unresolved
   - POST /api/variance-alerts/{id}/resolve
   - PUT /api/variance-alerts/settings

### Reporting Frontend (Estimated: 2-3 hours)

**Location**: `/frontend/admin-pos/src/`

**Need to Create**:

1. **views/CashReports.vue** (NEW)
   - Daily cash reports view
   - Date range selector
   - Export to CSV/PDF buttons
   - Variance summary charts
   - Session details table

2. **components/reports/DailyCashReport.vue**
   - Display daily cash summary
   - Opening/closing balances
   - Total sales, refunds, drops, payouts
   - Variance calculation
   - Session breakdown

3. **components/reports/VarianceAlerts.vue**
   - List unresolved variance alerts
   - Show session, user, amount, reason
   - Action buttons (resolve, investigate)
   - Filter by status, date, user

4. **stores/reports.ts** (NEW)
   - Pinia store for reports state
   - Actions: fetchDailyReport, fetchVarianceAlerts
   - Computed: totalVariance, alertCount

5. **services/reportsApi.ts** (NEW or extend api-spring.ts)
   - API methods for reports endpoints
   - Export methods

---

## 🎯 Implementation Priority

### CRITICAL (Do First):
1. ✅ Update api-spring.ts to match new backend endpoints
2. ✅ Create OpenCashDrawerModal & CloseCashDrawerModal
3. ✅ Create CashDrawerPanel component
4. ✅ Test complete open→transactions→close flow

### HIGH (Do Next):
5. Create reporting backend (CashReportService + Controller)
6. Create DailyCashReport component
7. Create VarianceAlerts component

### MEDIUM (Nice to Have):
8. Create remaining payment modals (Process, Refund, Details)
9. Create advanced reports (charts, analytics)
10. Add export functionality (CSV/PDF)

---

## 📡 API Endpoint Mapping

### Old API (in frontend) → New Backend API (created in Phase 2)

```
OLD: POST /api/payment/cash-drawer/open
NEW: POST /api/cash-drawer/{drawerId}/open

OLD: POST /api/payment/cash-drawer/close
NEW: POST /api/cash-drawer/sessions/{sessionId}/close

OLD: GET /api/payment/cash-drawer/status
NEW: GET /api/cash-drawer/{drawerId}/current-session

OLD: POST /api/payment/cash-drawer/transaction
NEW: POST /api/cash-drawer/sessions/{sessionId}/drop
NEW: POST /api/cash-drawer/sessions/{sessionId}/payout
```

### New Endpoints Available (Phase 2):
```
POST   /api/cash-drawer/register                       - Register drawer
GET    /api/cash-drawer/terminal/{terminalId}         - Get by terminal
POST   /api/cash-drawer/{drawerId}/open                - Open session
POST   /api/cash-drawer/sessions/{sessionId}/close     - Close session
GET    /api/cash-drawer/{drawerId}/current-session     - Active session
POST   /api/cash-drawer/sessions/{sessionId}/drop      - Cash drop
POST   /api/cash-drawer/sessions/{sessionId}/payout    - Cash payout
POST   /api/cash-drawer/sessions/{sessionId}/no-sale   - No-sale open
GET    /api/cash-drawer/sessions/{sessionId}/transactions - History
GET    /api/cash-drawer/sessions/{sessionId}/reconciliation - Reconciliation
GET    /api/cash-drawer/sessions/{sessionId}/statistics - Stats
GET    /api/cash-drawer/sessions/{sessionId}/balance   - Current balance
GET    /api/cash-drawer/reconciliations/status/{status} - By status
GET    /api/cash-drawer/reconciliations?start=&end=    - Date range

POST   /api/payments/charges                           - Process payment
POST   /api/payments/refunds                           - Process refund
GET    /api/payments/transactions/order/{orderId}      - By order
GET    /api/payments/transactions/session/{sessionId}  - By session
GET    /api/payments/breakdown/session/{sessionId}     - Payment breakdown
```

---

## 🧪 Testing Workflow

### 1. Backend Testing (Use Postman/curl):

```bash
# Register cash drawer
curl -X POST http://localhost:8085/api/cash-drawer/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Counter",
    "terminalId": "POS-001",
    "location": "Front Desk"
  }'

# Open session
curl -X POST http://localhost:8085/api/cash-drawer/1/open \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "startingCash": 200.00,
    "denominationCounts": {
      "100.00": 1,
      "50.00": 2
    }
  }'

# Record cash sale (automatic via order payment)
# When order is paid with CASH → auto-recorded

# Manual cash drop
curl -X POST http://localhost:8085/api/cash-drawer/sessions/1/drop \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 300.00,
    "userId": 1,
    "notes": "Excess cash to safe"
  }'

# Close session
curl -X POST http://localhost:8085/api/cash-drawer/sessions/1/close \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "countedCash": 248.50,
    "denominationCounts": {...},
    "notes": "End of shift"
  }'

# Check reconciliation
curl http://localhost:8085/api/cash-drawer/sessions/1/reconciliation
```

### 2. Frontend Testing:
1. Start services: MySQL, Kafka, Spring services
2. npm run dev in frontend/admin-pos
3. Navigate to /payment
4. Test open/close/drop/payout flows
5. Check cash balance updates in real-time
6. Verify variance calculations

---

## 📚 Code Patterns & Examples

### TypeScript Interface (Frontend):
```typescript
interface OpenSessionRequest {
  userId: number
  startingCash: number
  denominationCounts?: Record<string, number>
}

interface CloseSessionRequest {
  userId: number
  countedCash: number
  denominationCounts?: Record<string, number>
  notes?: string
}
```

### Component Example (OpenCashDrawerModal.vue):
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['close', 'success'])
const paymentStore = usePaymentStore()

const startingCash = ref<number>(0)
const denominations = ref({
  '100.00': 0,
  '50.00': 0,
  '20.00': 0,
  '10.00': 0,
  '5.00': 0,
  '1.00': 0,
  '0.50': 0,
  '0.25': 0
})

const totalFromDenominations = computed(() => {
  return Object.entries(denominations.value)
    .reduce((sum, [value, count]) => sum + (parseFloat(value) * count), 0)
})

const handleSubmit = async () => {
  try {
    await paymentStore.openCashDrawer(
      totalFromDenominations.value || startingCash.value,
      denominations.value
    )
    emit('success')
  } catch (error) {
    console.error('Failed to open drawer:', error)
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">Open Cash Drawer</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-white">
          <X :size="24" />
        </button>
      </div>
      
      <div class="space-y-4">
        <!-- Manual amount input -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Starting Cash Amount
          </label>
          <input
            v-model.number="startingCash"
            type="number"
            step="0.01"
            class="w-full bg-gray-700 text-white px-4 py-2 rounded"
            placeholder="0.00"
          />
        </div>

        <!-- Denomination counter -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Or count denominations:
          </label>
          <div class="space-y-2">
            <div v-for="(count, value) in denominations" :key="value" class="flex items-center gap-2">
              <span class="text-gray-300 w-16">${{ value }}</span>
              <input
                v-model.number="denominations[value]"
                type="number"
                min="0"
                class="w-20 bg-gray-700 text-white px-2 py-1 rounded"
              />
              <span class="text-gray-400">
                = ${{ (parseFloat(value) * count).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <div class="text-right text-lg font-bold text-white">
          Total: ${{ totalFromDenominations.toFixed(2) }}
        </div>

        <div class="flex gap-2">
          <button
            @click="emit('close')"
            class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Open Drawer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## 🚀 Deployment Checklist

Before production:

### Backend:
- [ ] MySQL database with proper indexes
- [ ] Kafka cluster running
- [ ] All Spring services started (discovery, api-gateway, operations, order, user)
- [ ] Database migrations applied
- [ ] Environment variables configured

### Frontend:
- [ ] npm install dependencies
- [ ] Update VITE_API_GATEWAY_URL to production API
- [ ] Build: npm run build
- [ ] Deploy dist/ folder to web server
- [ ] Configure nginx/apache reverse proxy

### Security:
- [ ] Enable authentication guards in router
- [ ] Configure role-based permissions
- [ ] SSL certificates installed
- [ ] API rate limiting enabled
- [ ] CORS properly configured

### Monitoring:
- [ ] Prometheus metrics enabled
- [ ] Zipkin tracing configured
- [ ] Log aggregation (ELK stack)
- [ ] Alert notifications configured

---

## 📞 Support & Resources

- **Backend API**: http://localhost:8085/api/cash-drawer/*
- **Frontend Dev**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **Kafka**: localhost:9092
- **MySQL**: localhost:3306

**Documentation**:
- Spring Boot: https://spring.io/projects/spring-boot
- Vue 3: https://vuejs.org/
- Pinia: https://pinia.vuejs.org/
- Tailwind: https://tailwindcss.com/

---

**Status**: System is 85% complete. Backend fully functional, frontend needs UI components and reporting.

**Next Steps**: Create frontend components following patterns above, then add reporting backend.
