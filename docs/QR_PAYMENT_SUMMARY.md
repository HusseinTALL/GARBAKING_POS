# 📱 QR Payment Workflow - Quick Summary

**Status:** Ready to Implement
**Priority:** HIGH
**Estimated Timeline:** 4-5 weeks

---

## 🎯 **What We're Building**

A secure QR code-based payment confirmation system that allows cashiers to:
1. Scan a customer's order QR code
2. Instantly retrieve full order details
3. Confirm payment with one click
4. Works offline with automatic sync

---

## 🔑 **Key Features**

### **For Customers**
- ✅ QR code displayed after order placement
- ✅ 6-8 character short code as fallback
- ✅ Auto-refresh when QR expires (5 min)
- ✅ Real-time payment confirmation notification

### **For Cashiers**
- ✅ Scan QR with device camera
- ✅ View complete order details instantly
- ✅ Confirm payment in one click
- ✅ Works offline - syncs when reconnected
- ✅ Manual code entry if no camera

### **Security**
- ✅ JWT tokens with HMAC-SHA256 signing
- ✅ 5-10 minute expiry on QR codes
- ✅ Replay protection (one-time use)
- ✅ Rate limiting (10 scans/minute)
- ✅ Role-based access control
- ✅ Full audit trail

---

## 📊 **Order Status Flow**

```
Customer Places Order
        ↓
   [PENDING] + QR Code Generated
        ↓
   Cashier Scans QR
        ↓
   Order Details Displayed
        ↓
   Cashier Confirms Payment
        ↓
      [PAID]
        ↓
   [CONFIRMED] → [PREPARING] → [READY] → [COMPLETED]
```

---

## 🗄️ **Database Changes**

### **New Tables**
1. **payment_qr_tokens** - Stores QR token metadata
   - Token ID, nonce, short code
   - Expiry tracking
   - Usage tracking (one-time use)
   - Device/user who used it

2. **qr_scan_audit_log** - Complete audit trail
   - All scan attempts
   - Payment confirmations
   - Failures and errors
   - Performance metrics
   - Device fingerprinting

### **Updates to Existing Tables**
- **orders** table:
  - `qr_token_id` - Reference to active QR
  - `qr_payment_confirmed_at` - When paid via QR
  - `qr_confirmed_by_user_id` - Who confirmed
  - `qr_confirmed_by_device_id` - Which device

---

## 🔐 **Security Architecture**

### **QR Token Structure**
```javascript
{
  "jti": "qr_token_xyz123",           // Unique token ID
  "order_id": 12345,                  // Order reference
  "order_number": "ORD-20251102-001", // Human-readable
  "nonce": "abc123def456",            // Replay protection
  "amount": "25.50",                  // For display only
  "short_code": "QR12AB",             // Fallback code
  "exp": 1730534700                   // 5 min expiry
}
```

### **Security Measures**
1. **Signature Verification** - HMAC-SHA256
2. **Expiry Check** - 5-10 minute TTL
3. **Replay Protection** - Nonce checked, token marked as used
4. **Rate Limiting** - 10 scans/minute per device
5. **RBAC** - Only ADMIN/STAFF/CASHIER roles can confirm
6. **Audit Logging** - Every action tracked

---

## 📱 **User Experience**

### **Customer App Flow**
```
1. Customer completes order
2. Order Confirmation page shows:
   ├─ QR Code (large, scannable)
   ├─ Short Code (e.g., "QR12AB")
   ├─ Expiry Timer (5:00 countdown)
   └─ "Show to cashier" instruction

3. If QR expires:
   └─ "Refresh" button generates new QR

4. When cashier confirms payment:
   └─ Real-time toast: "Payment Confirmed! ✅"
```

### **Admin POS Flow**
```
1. Cashier clicks "Scan QR Payment"
2. Camera modal opens
3. Scan customer's QR code
4. Order detail modal shows:
   ├─ Customer info
   ├─ Order items & totals
   ├─ Payment status
   └─ "Confirm Payment" button

5. Select payment method → Confirm
6. Success toast → Order marked PAID
```

---

## 🌐 **Offline-First Architecture**

### **Online Flow**
```
Scan QR → Validate → Retrieve Order → Confirm Payment → Update DB → Broadcast
```

### **Offline Flow**
```
Scan QR → Validate Locally → Queue in IndexedDB
                ↓
          Network Reconnects
                ↓
         Sync Queue → POST /api/qr-payment/confirm
                ↓
         Idempotent Check → Update DB → Broadcast
```

### **Sync Features**
- ✅ Automatic retry on reconnect
- ✅ Idempotent confirmation (no duplicates)
- ✅ Queue persistence (survives app restart)
- ✅ Conflict resolution (server wins)
- ✅ User feedback (sync status indicator)

---

## 📊 **API Endpoints**

### **Backend (Order Service)**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/qr-payment/scan` | Scan QR and retrieve order | STAFF+ |
| POST | `/api/qr-payment/confirm` | Confirm payment | STAFF+ |
| GET | `/api/orders/:id/qr-token` | Get current QR token | PUBLIC |
| POST | `/api/orders/:id/regenerate-qr` | Regenerate expired QR | PUBLIC |

### **Request/Response Examples**

**Scan QR:**
```json
// Request
POST /api/qr-payment/scan
Headers: {
  "X-Device-Id": "pos-terminal-01",
  "X-User-Id": "123"
}
Body: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Response
{
  "success": true,
  "order": { /* Full OrderDTO */ },
  "tokenId": "qr_token_xyz123",
  "shortCode": "QR12AB",
  "expiresAt": "2025-11-02T14:35:00Z"
}
```

**Confirm Payment:**
```json
// Request
POST /api/qr-payment/confirm
Headers: {
  "X-Device-Id": "pos-terminal-01",
  "X-User-Id": "123"
}
Body: {
  "orderId": 12345,
  "tokenId": "qr_token_xyz123",
  "paymentMethod": "CASH",
  "transactionId": "TXN-123456"
}

// Response
{
  "id": 12345,
  "orderNumber": "ORD-20251102-001",
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "paidAt": "2025-11-02T14:30:00Z",
  // ... rest of OrderDTO
}
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- ✅ QRTokenService (generation, validation)
- ✅ QRPaymentService (scan, confirm)
- ✅ JWT encoding/decoding
- ✅ Nonce generation and validation

### **Integration Tests**
- ✅ Full QR workflow (generate → scan → confirm)
- ✅ Expired token rejection
- ✅ Replay attack prevention
- ✅ Rate limiting enforcement
- ✅ RBAC enforcement

### **E2E Tests** (10 Acceptance Criteria)
1. ✅ Online payment confirmation
2. ✅ Offline payment confirmation with sync
3. ✅ Expired QR code handling
4. ✅ Replayed QR code rejection
5. ✅ Wrong tenant/site validation
6. ✅ Partial sync (multiple queued payments)
7. ✅ Idempotent confirmation
8. ✅ Short code fallback
9. ✅ Rate limiting
10. ✅ RBAC enforcement

### **Performance Tests**
- ✅ QR generation < 100ms
- ✅ Scan-to-display < 500ms
- ✅ Payment confirmation < 1s
- ✅ 100 concurrent scans
- ✅ Offline sync < 5s

---

## 📦 **Dependencies**

### **Backend (Java/Spring Boot)**
```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
</dependency>

<!-- Rate Limiting -->
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.1.0</version>
</dependency>
```

### **Frontend - Customer App**
```json
{
  "dependencies": {
    "qrcode": "^1.5.3",        // QR code generation
    "uuid": "^9.0.1"            // Already installed
  }
}
```

### **Frontend - Admin POS**
```json
{
  "dependencies": {
    "html5-qrcode": "^2.3.8",  // QR scanner
    "idb": "^7.1.1"             // Already installed (offline storage)
  }
}
```

---

## 📈 **Success Metrics**

### **Adoption Metrics**
- **Target:** 70% of orders use QR payment within 3 months
- **Baseline:** 0% (new feature)

### **Performance Metrics**
- **QR Scan Success Rate:** > 95%
- **Payment Confirmation Time:** < 10 seconds average
- **Offline Sync Success Rate:** > 99%

### **Security Metrics**
- **Replay Attempts Blocked:** 100%
- **Expired Token Attempts:** < 10%
- **Unauthorized Access Attempts:** 0 successful

### **Business Impact**
- **Faster Checkout:** 30% reduction in payment time
- **Reduced Errors:** 50% fewer manual entry errors
- **Customer Satisfaction:** +15% NPS score

---

## 🚀 **Implementation Timeline**

### **Week 1: Backend Foundation**
- Database migrations
- JWT token service
- QR generation API
- Basic validation

### **Week 2: Backend Complete**
- Payment confirmation logic
- Offline sync handling
- Audit logging
- Rate limiting & security
- Unit tests

### **Week 3: Frontend - Customer App**
- QR display component
- Expiry timer
- Short code fallback
- Auto-refresh
- WebSocket integration

### **Week 4: Frontend - Admin POS**
- QR scanner modal
- Camera integration
- Order detail modal
- Payment confirmation UI
- Offline queue
- Sync logic

### **Week 5: Testing & Deployment**
- Integration tests
- E2E tests
- Security testing
- Performance testing
- Staging deployment
- Production rollout (gradual)

---

## 🎓 **Training Plan**

### **For Cashiers**
1. **How to scan QR codes** (2 min)
2. **Using manual code entry** (1 min)
3. **Handling expired codes** (1 min)
4. **Offline mode indicator** (1 min)
5. **Troubleshooting common issues** (3 min)

**Total Training Time:** 8 minutes

### **Training Materials**
- ✅ Quick reference card
- ✅ Video tutorial (3 min)
- ✅ FAQs document
- ✅ Troubleshooting guide

---

## 🔧 **Monitoring & Alerts**

### **Dashboards**
1. **QR Payment Overview**
   - Scans per hour/day
   - Success rate
   - Average confirmation time
   - Offline sync queue size

2. **Security Dashboard**
   - Invalid token attempts
   - Replay attempts
   - Rate limit hits
   - Unauthorized access

3. **Performance Dashboard**
   - QR generation latency
   - Scan latency
   - Confirmation latency
   - WebSocket delivery time

### **Alerts**
- 🚨 **Critical:** QR scan success rate < 90%
- ⚠️ **Warning:** Average confirmation time > 5s
- ⚠️ **Warning:** Offline queue > 100 items
- 🚨 **Critical:** Payment confirmation errors > 1%

---

## 📞 **Rollback Plan**

If major issues occur:

1. **Disable QR Payment Feature**
   ```sql
   UPDATE system_settings SET qr_payment_enabled = FALSE;
   ```

2. **Fallback to Manual Payment Entry**
   - Orders still work normally
   - Cashiers use existing payment flow
   - No data loss

3. **Investigation & Fix**
   - Review audit logs
   - Identify root cause
   - Deploy hotfix
   - Re-enable feature

---

## ✅ **Go-Live Checklist**

### **Pre-Launch**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Training materials ready
- [ ] Monitoring dashboards configured
- [ ] Alerts configured
- [ ] Rollback plan tested

### **Launch Day**
- [ ] Deploy to production (off-peak hours)
- [ ] Enable for 10% of orders (feature flag)
- [ ] Monitor metrics for 24 hours
- [ ] If stable, increase to 50%
- [ ] Monitor for 48 hours
- [ ] If stable, enable 100%

### **Post-Launch**
- [ ] Daily metric review (week 1)
- [ ] Weekly metric review (month 1)
- [ ] Gather user feedback
- [ ] Iterate on improvements

---

## 📚 **Resources**

- **Full Implementation Plan:** [QR_PAYMENT_WORKFLOW_IMPLEMENTATION.md](QR_PAYMENT_WORKFLOW_IMPLEMENTATION.md)
- **System Analysis:** [SYSTEM_ANALYSIS.md](SYSTEM_ANALYSIS.md)
- **API Documentation:** [API_CONTRACTS.md](API_CONTRACTS.md)
- **Security Guide:** [SECURITY.md](SECURITY.md)

---

**Document Version:** 1.0
**Last Updated:** November 2, 2025
**Next Review:** After implementation complete
