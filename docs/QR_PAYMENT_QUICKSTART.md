# 🚀 QR Payment Workflow - Quick Start Guide

**For Developers Starting Implementation**

---

## ⚡ **Start Here**

This guide gets you implementing the QR payment workflow in **under 30 minutes**.

---

## 📋 **Step-by-Step Implementation**

### **Step 1: Database Setup (5 minutes)**

Run these migrations in your MySQL database:

```bash
cd garbaking-backend/order-service/src/main/resources/db/migration
```

Create `V004__add_qr_payment_tables.sql`:

```sql
-- 1. Create payment_qr_tokens table
CREATE TABLE payment_qr_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_id VARCHAR(50) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL,
    nonce VARCHAR(100) NOT NULL UNIQUE,
    short_code VARCHAR(8) NOT NULL UNIQUE,
    token_hash VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    used_by_device_id VARCHAR(100) NULL,
    used_by_user_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_qr_token_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_token_id (token_id),
    INDEX idx_order_id (order_id),
    INDEX idx_short_code (short_code)
) ENGINE=InnoDB;

-- 2. Create qr_scan_audit_log table
CREATE TABLE qr_scan_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NULL,
    token_id VARCHAR(50) NULL,
    short_code VARCHAR(8) NULL,
    action VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message VARCHAR(500) NULL,
    device_id VARCHAR(100) NOT NULL,
    user_id BIGINT NULL,
    processing_time_ms INT NULL,
    scan_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_scan_timestamp (scan_timestamp)
) ENGINE=InnoDB;

-- 3. Update orders table
ALTER TABLE orders
ADD COLUMN qr_token_id VARCHAR(50) NULL,
ADD COLUMN qr_payment_confirmed_at TIMESTAMP NULL,
ADD COLUMN qr_confirmed_by_user_id BIGINT NULL,
ADD COLUMN qr_confirmed_by_device_id VARCHAR(100) NULL,
ADD INDEX idx_qr_token_id (qr_token_id);
```

Run migration:
```bash
cd garbaking-backend
./gradlew :order-service:flywayMigrate
```

---

### **Step 2: Backend - Add Dependencies (2 minutes)**

Update `garbaking-backend/order-service/build.gradle`:

```gradle
dependencies {
    // Existing dependencies...

    // JWT for QR tokens
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
    implementation 'io.jsonwebtoken:jjwt-impl:0.11.5'
    implementation 'io.jsonwebtoken:jjwt-jackson:0.11.5'

    // Rate limiting
    implementation 'com.github.vladimir-bukhtoyarov:bucket4j-core:8.1.0'
}
```

---

### **Step 3: Backend - Configuration (2 minutes)**

Update `order-service/src/main/resources/application.yml`:

```yaml
qr:
  token:
    # IMPORTANT: Change this secret in production!
    secret: ${QR_TOKEN_SECRET:your-256-bit-secret-key-change-in-production-must-be-32-chars-min}
    expiry:
      minutes: 5
    issuer: garbaking-pos

security:
  rate-limit:
    qr-scan:
      requests: 10
      per-seconds: 60
    qr-confirm:
      requests: 5
      per-seconds: 60
```

---

### **Step 4: Backend - Create Entities (5 minutes)**

Create `PaymentQRToken.java`:

```bash
cd garbaking-backend/order-service/src/main/java/com/garbaking/orderservice/model
```

```java
package com.garbaking.orderservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_qr_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentQRToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String tokenId;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false, unique = true, length = 100)
    private String nonce;

    @Column(nullable = false, unique = true, length = 8)
    private String shortCode;

    @Column(nullable = false, length = 255)
    private String tokenHash;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isUsed = false;

    private LocalDateTime usedAt;

    @Column(length = 100)
    private String usedByDeviceId;

    private Long usedByUserId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
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

Create `QRScanAuditLog.java` (similar structure, see full implementation plan).

---

### **Step 5: Backend - Create Repositories (2 minutes)**

Create `PaymentQRTokenRepository.java`:

```java
package com.garbaking.orderservice.repository;

import com.garbaking.orderservice.model.PaymentQRToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentQRTokenRepository extends JpaRepository<PaymentQRToken, Long> {
    Optional<PaymentQRToken> findByTokenId(String tokenId);
    Optional<PaymentQRToken> findByShortCode(String shortCode);
    Optional<PaymentQRToken> findByOrderId(Long orderId);
}
```

---

### **Step 6: Backend - QRTokenService (10 minutes)**

Copy the full `QRTokenService.java` from the implementation plan:

```bash
cd garbaking-backend/order-service/src/main/java/com/garbaking/orderservice/service
# Copy QRTokenService.java from the implementation plan
```

Key methods:
- `generateToken(Order order)` - Generates JWT token
- `validateToken(String token)` - Validates and decodes token
- `markTokenUsed(String tokenId, ...)` - Marks token as used
- `validateByShortCode(String code)` - Fallback validation

---

### **Step 7: Backend - Update OrderService (3 minutes)**

Add QR token generation to order creation:

```java
@Service
public class OrderService {

    @Autowired
    private QRTokenService qrTokenService;

    @Transactional
    public OrderDTO createOrder(CreateOrderDTO createOrderDTO) {
        // ... existing order creation logic ...

        Order savedOrder = orderRepository.save(order);

        // 🆕 Generate QR token for payment
        PaymentQRToken qrToken = qrTokenService.generateToken(savedOrder);
        savedOrder.setQrTokenId(qrToken.getTokenId());
        orderRepository.save(savedOrder);

        // ... rest of logic ...
        return mapToDTO(savedOrder);
    }
}
```

---

### **Step 8: Backend - Create QR Controller (5 minutes)**

Create `QRPaymentController.java`:

```java
@RestController
@RequestMapping("/qr-payment")
@RequiredArgsConstructor
@Slf4j
public class QRPaymentController {

    private final QRPaymentService qrPaymentService;

    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CASHIER')")
    public ResponseEntity<QRScanResultDTO> scanQRCode(
            @RequestBody String qrToken,
            @RequestHeader("X-Device-Id") String deviceId,
            @RequestHeader("X-User-Id") Long userId
    ) {
        QRScanResultDTO result = qrPaymentService.scanQRCode(qrToken, deviceId, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CASHIER')")
    public ResponseEntity<OrderDTO> confirmPayment(
            @Valid @RequestBody ConfirmPaymentDTO confirmDTO,
            @RequestHeader("X-Device-Id") String deviceId,
            @RequestHeader("X-User-Id") Long userId
    ) {
        OrderDTO order = qrPaymentService.confirmPayment(
                confirmDTO.getOrderId(),
                confirmDTO,
                confirmDTO.getTokenId(),
                userId,
                deviceId
        );
        return ResponseEntity.ok(order);
    }
}
```

---

### **Step 9: Frontend - Customer App (10 minutes)**

#### Install QR library:
```bash
cd frontend/customer-app
npm install qrcode
```

#### Create QRCodeDisplay component:

```vue
<!-- src/components/QRCodeDisplay.vue -->
<template>
  <div class="qr-display">
    <canvas ref="qrCanvas"></canvas>
    <div class="short-code">{{ shortCode }}</div>
    <div class="timer">Expires in {{ formatTime }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = defineProps(['qrToken', 'shortCode', 'expiresAt'])
const qrCanvas = ref(null)

onMounted(async () => {
  await QRCode.toCanvas(qrCanvas.value, props.qrToken, {
    width: 300,
    margin: 2
  })
})
</script>
```

#### Update OrderConfirmation view:

```vue
<!-- src/views/OrderConfirmation.vue -->
<template>
  <div class="order-confirmation">
    <!-- Existing order details -->

    <!-- 🆕 Add QR Code -->
    <QRCodeDisplay
      v-if="order.qrToken"
      :qr-token="order.qrToken"
      :short-code="order.shortCode"
      :expires-at="order.qrExpiresAt"
    />
  </div>
</template>

<script setup>
import QRCodeDisplay from '@/components/QRCodeDisplay.vue'
// ... rest of component
</script>
```

---

### **Step 10: Frontend - Admin POS (10 minutes)**

#### Install QR scanner:
```bash
cd frontend/admin-pos
npm install html5-qrcode
```

#### Create QRScannerModal component:

```vue
<!-- src/components/QRScannerModal.vue -->
<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <h2>Scan QR Code</h2>
      <div id="qr-reader"></div>

      <!-- Manual code entry -->
      <div class="manual-entry">
        <input v-model="manualCode" placeholder="Or enter code manually" />
        <button @click="submitManualCode">Submit</button>
      </div>

      <button @click="close">Cancel</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const emit = defineEmits(['scanned', 'close'])
const props = defineProps(['show'])

const manualCode = ref('')
let html5QrCode = null

onMounted(async () => {
  if (props.show) {
    html5QrCode = new Html5Qrcode('qr-reader')
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      onScanSuccess
    )
  }
})

onUnmounted(() => {
  if (html5QrCode) {
    html5QrCode.stop()
  }
})

function onScanSuccess(decodedText) {
  emit('scanned', decodedText)
  close()
}

function submitManualCode() {
  if (manualCode.value) {
    emit('scanned', manualCode.value)
    close()
  }
}

function close() {
  if (html5QrCode) {
    html5QrCode.stop()
  }
  emit('close')
}
</script>
```

---

### **Step 11: Test It! (5 minutes)**

#### Terminal 1 - Start Backend:
```bash
cd garbaking-backend
./gradlew :order-service:bootRun
```

#### Terminal 2 - Start Customer App:
```bash
cd frontend/customer-app
npm run dev
```

#### Terminal 3 - Start Admin POS:
```bash
cd frontend/admin-pos
npm run dev
```

#### Test Flow:
1. Open Customer App → Create order
2. See QR code displayed
3. Open Admin POS → Click "Scan QR"
4. Scan QR → Order details appear
5. Click "Confirm Payment" → Success!

---

## 🔍 **Quick Testing Checklist**

- [ ] QR code displays after order creation
- [ ] QR code is scannable (test with phone)
- [ ] Short code displays correctly
- [ ] Expiry timer counts down
- [ ] Scanner opens camera
- [ ] Scanning retrieves order details
- [ ] Payment confirmation works
- [ ] Order status updates to PAID
- [ ] WebSocket updates customer app

---

## 🐛 **Common Issues**

### **Issue: QR code not generating**
```bash
# Check logs
tail -f garbaking-backend/order-service/logs/application.log

# Verify JWT secret is set
echo $QR_TOKEN_SECRET
```

### **Issue: Camera not working**
```javascript
// Check browser permissions
navigator.mediaDevices.getUserMedia({ video: true })
  .then(() => console.log('Camera OK'))
  .catch(err => console.error('Camera error:', err))
```

### **Issue: Token validation failing**
```sql
-- Check token in database
SELECT * FROM payment_qr_tokens ORDER BY created_at DESC LIMIT 1;

-- Check if token is expired or used
SELECT token_id, is_used, expires_at FROM payment_qr_tokens WHERE order_id = ?;
```

---

## 📚 **Next Steps**

Once basic flow is working:

1. **Add Offline Support** - Implement IndexedDB queue
2. **Add Rate Limiting** - Protect scan endpoints
3. **Add Analytics** - Track usage metrics
4. **Write Tests** - Unit, integration, E2E
5. **Security Audit** - Review implementation
6. **Documentation** - Update user guides

---

## 🆘 **Need Help?**

- **Full Implementation Plan:** [QR_PAYMENT_WORKFLOW_IMPLEMENTATION.md](QR_PAYMENT_WORKFLOW_IMPLEMENTATION.md)
- **Summary Guide:** [QR_PAYMENT_SUMMARY.md](QR_PAYMENT_SUMMARY.md)
- **System Architecture:** [SYSTEM_ANALYSIS.md](SYSTEM_ANALYSIS.md)

---

**Happy Coding! 🚀**
