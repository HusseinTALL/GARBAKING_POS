# QR Payment API Documentation

Complete API reference for the QR code-based payment confirmation workflow.

---

## Base URL

```
http://localhost:8082/api/qr-payment
```

---

## Authentication

All endpoints require authentication with one of the following roles:
- `ADMIN`
- `STAFF`
- `CASHIER`
- `CUSTOMER` (for token retrieval only)

Include JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Rate Limits

- **Scan Operations**: 10 requests per minute per device
- **Confirmation Operations**: 5 requests per minute per device

Rate limit exceeded response:
```json
{
  "success": false,
  "errorMessage": "Too many scan attempts. Please wait.",
  "errorCode": "RATE_LIMIT_EXCEEDED"
}
```

---

## Endpoints

### 1. Scan QR Code

Scan a QR code JWT token and retrieve order details.

**Endpoint:** `POST /api/qr-payment/scan`

**Authorization:** `ADMIN`, `STAFF`, `CASHIER`

**Request Body:**
```json
{
  "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "deviceId": "POS-001"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "order": {
    "id": 123,
    "orderNumber": "ORD-2025-001",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "totalAmount": 13000,
    "items": [
      {
        "menuItemName": "Garbure Burger",
        "quantity": 2,
        "unitPrice": 5500,
        "subtotal": 11000
      }
    ],
    "customerName": "John Doe",
    "tableNumber": "T-05"
  },
  "tokenId": "qr_abc123",
  "shortCode": "QR2A3B4C",
  "expiresAt": "2025-11-02T14:30:00"
}
```

**Error Responses:**

**400 Bad Request** - Token invalid/expired:
```json
{
  "success": false,
  "errorMessage": "Token expired",
  "errorCode": "TOKEN_EXPIRED"
}
```

**400 Bad Request** - Order already paid:
```json
{
  "success": false,
  "errorMessage": "Order already paid",
  "errorCode": "ORDER_ALREADY_PAID"
}
```

**Error Codes:**
- `TOKEN_EXPIRED` - QR token has expired (> 5 minutes)
- `TOKEN_USED` - Token already used for payment
- `TOKEN_INVALID` - Invalid token signature or format
- `TOKEN_NOT_FOUND` - Token not in database
- `REPLAY_ATTACK` - Nonce mismatch detected
- `ORDER_ALREADY_PAID` - Order payment already confirmed
- `SCAN_FAILED` - Unexpected error during scan

---

### 2. Scan by Short Code

Fallback method when camera is unavailable. Scan using 8-character code.

**Endpoint:** `POST /api/qr-payment/scan-short-code`

**Authorization:** `ADMIN`, `STAFF`, `CASHIER`

**Request Body:**
```json
{
  "shortCode": "QR2A3B4C",
  "deviceId": "POS-001"
}
```

**Success Response:** Same as QR scan above

**Error Codes:** Same as QR scan above

---

### 3. Confirm Payment

Confirm payment for a scanned order. Marks token as used and updates order status.

**Endpoint:** `POST /api/qr-payment/confirm`

**Authorization:** `ADMIN`, `STAFF`, `CASHIER`

**Request Body:**
```json
{
  "orderId": 123,
  "tokenId": "qr_abc123",
  "paymentMethod": "CASH",
  "transactionId": "TXN-2025-001",
  "amountReceived": 15000,
  "notes": "Exact change",
  "deviceId": "POS-001"
}
```

**Field Descriptions:**
- `orderId` (required): Order ID from scan result
- `tokenId` (required): Token ID from scan result
- `paymentMethod` (required): `CASH`, `CARD`, `MOBILE_MONEY`, `BANK_TRANSFER`
- `transactionId` (optional): External transaction reference
- `amountReceived` (optional): Amount received from customer (XOF)
- `notes` (optional): Additional payment notes
- `deviceId` (required): POS device identifier

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "order": {
    "id": 123,
    "orderNumber": "ORD-2025-001",
    "status": "CONFIRMED",
    "paymentStatus": "PAID",
    "paymentMethod": "CASH",
    "totalAmount": 13000,
    "paidAt": "2025-11-02T14:25:30",
    "qrPaymentConfirmedAt": "2025-11-02T14:25:30"
  }
}
```

**Error Responses:**

**400 Bad Request** - Order already paid:
```json
{
  "success": false,
  "errorMessage": "Order already paid",
  "errorCode": "CONFIRMATION_FAILED"
}
```

**400 Bad Request** - Token already used:
```json
{
  "success": false,
  "errorMessage": "Token already marked as used",
  "errorCode": "CONFIRMATION_FAILED"
}
```

**404 Not Found** - Order not found:
```json
{
  "success": false,
  "errorMessage": "Order not found with id: 123",
  "errorCode": "CONFIRMATION_FAILED"
}
```

---

### 4. Get QR Token for Order

Retrieve existing QR token for an order.

**Endpoint:** `GET /api/qr-payment/orders/{orderId}/token`

**Authorization:** `ADMIN`, `STAFF`, `CASHIER`, `CUSTOMER`

**Path Parameters:**
- `orderId` - The order ID

**Success Response (200 OK):**
```json
{
  "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenId": "qr_abc123",
  "shortCode": "QR2A3B4C",
  "issuedAt": "2025-11-02T14:25:00",
  "expiresAt": "2025-11-02T14:30:00",
  "expiresInSeconds": 300,
  "orderId": 123,
  "orderNumber": "ORD-2025-001"
}
```

**Error Responses:**

**404 Not Found** - No valid token:
```json
{
  "success": false,
  "errorMessage": "No valid QR token found for this order",
  "errorCode": "TOKEN_NOT_FOUND"
}
```

---

### 5. Regenerate QR Token

Regenerate an expired QR token for an order.

**Endpoint:** `POST /api/qr-payment/orders/{orderId}/regenerate-token`

**Authorization:** `ADMIN`, `STAFF`, `CASHIER`

**Path Parameters:**
- `orderId` - The order ID

**Success Response (200 OK):**
```json
{
  "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenId": "qr_xyz789",
  "shortCode": "QR9X8Y7Z",
  "issuedAt": "2025-11-02T14:35:00",
  "expiresAt": "2025-11-02T14:40:00",
  "expiresInSeconds": 300,
  "orderId": 123,
  "orderNumber": "ORD-2025-001"
}
```

**Error Responses:**

**400 Bad Request** - Order already paid:
```json
{
  "success": false,
  "errorMessage": "Cannot regenerate QR token for already paid order: ORD-2025-001",
  "errorCode": "REGENERATION_NOT_ALLOWED"
}
```

**404 Not Found** - Order not found:
```json
{
  "success": false,
  "errorMessage": "Order not found with id: 123",
  "errorCode": "REGENERATION_FAILED"
}
```

---

## JWT Token Structure

The QR code contains a JWT token with the following claims:

```json
{
  "jti": "qr_abc123",
  "iss": "garbaking-pos",
  "aud": "payment-confirmation",
  "sub": "order_123",
  "iat": 1730554500,
  "exp": 1730554800,
  "order_id": 123,
  "order_number": "ORD-2025-001",
  "nonce": "550e8400-e29b-41d4-a716-446655440000",
  "amount": "13000",
  "currency": "XOF",
  "short_code": "QR2A3B4C",
  "v": 1
}
```

**Claim Descriptions:**
- `jti` - Unique token ID
- `iss` - Issuer (garbaking-pos)
- `aud` - Audience (payment-confirmation)
- `sub` - Subject (order_ID)
- `iat` - Issued at timestamp
- `exp` - Expiration timestamp (iat + 5 minutes)
- `order_id` - Order database ID
- `order_number` - Human-readable order number
- `nonce` - One-time use nonce for replay protection
- `amount` - Order total amount
- `currency` - Currency code (XOF)
- `short_code` - 8-character fallback code
- `v` - Token version

**Security:**
- Signed with HMAC-SHA256
- 5-minute expiration
- One-time use via nonce
- Replay protection
- Device tracking

---

## Short Code Format

**Format:** `QR` + 6 random alphanumeric characters

**Example:** `QR2A3B4C`

**Character Set:** A-Z, 2-9 (excludes 0, O, I, 1 to avoid confusion)

**Usage:** Manual entry when QR scanner unavailable

---

## WebSocket Events

When payment is confirmed, real-time updates are broadcast via WebSocket:

**Topics:**
- `/topic/orders/updated` - General order updates
- `/topic/orders/payment` - Payment-specific updates (PAID status only)

**Event Payload:**
```json
{
  "id": 123,
  "orderNumber": "ORD-2025-001",
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "totalAmount": 13000,
  "paidAt": "2025-11-02T14:25:30"
}
```

---

## Audit Logging

All QR operations are logged to `qr_scan_audit_logs` table:

**Logged Actions:**
- `SCAN` - QR code or short code scan attempt
- `CONFIRM_PAYMENT` - Payment confirmation attempt

**Logged Status:**
- `SUCCESS` - Operation succeeded
- `FAILED` - Generic failure
- `DUPLICATE` - Already paid/used
- `TOKEN_EXPIRED` - Token expired
- `TOKEN_USED` - Token already used
- `TOKEN_INVALID` - Invalid token
- `TOKEN_NOT_FOUND` - Token not in database
- `REPLAY_ATTACK` - Nonce mismatch

**Analytics Queries:**
Available via repository methods for:
- Failed scan attempts
- Average scan processing time
- Security events (replay attacks, etc.)
- Payment method distribution
- Scan success rate

---

## Testing

### Manual Testing with cURL

**1. Create Order (via Order API):**
```bash
curl -X POST http://localhost:8082/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderType": "DINE_IN",
    "userId": 1,
    "customerName": "Test Customer",
    "items": [{"menuItemId": 1, "quantity": 1, "unitPrice": 5000}]
  }'
```

**2. Get QR Token:**
```bash
curl http://localhost:8082/api/qr-payment/orders/123/token
```

**3. Scan QR Code:**
```bash
curl -X POST http://localhost:8082/api/qr-payment/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "eyJhbGci...",
    "deviceId": "POS-001"
  }'
```

**4. Confirm Payment:**
```bash
curl -X POST http://localhost:8082/api/qr-payment/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 123,
    "tokenId": "qr_abc123",
    "paymentMethod": "CASH",
    "deviceId": "POS-001"
  }'
```

### Automated Testing

Run the comprehensive test script:
```bash
cd garbaking-backend
./test-qr-workflow.sh
```

This tests:
- ✅ Service health
- ✅ Order creation
- ✅ QR token generation
- ✅ QR code scanning
- ✅ Short code scanning
- ✅ Payment confirmation
- ✅ Duplicate prevention
- ✅ Already-paid detection

---

## Error Handling Best Practices

**Client-Side:**
1. Check `success` field in response
2. Display `errorMessage` to user
3. Use `errorCode` for programmatic handling
4. Implement retry logic for transient failures
5. Handle rate limits with exponential backoff

**Server-Side:**
- All errors logged with context
- Audit logs created for security events
- WebSocket failures don't block payment
- Token generation failures don't fail order creation

---

## Configuration

**application.yml:**
```yaml
qr:
  token:
    secret: ${QR_TOKEN_SECRET:your-secret-key-min-32-chars}
    expiry:
      minutes: 5
    issuer: garbaking-pos
    audience: payment-confirmation

security:
  rate-limit:
    qr-scan:
      requests: 10
      per-seconds: 60
    qr-confirm:
      requests: 5
      per-seconds: 60
```

**Environment Variables:**
- `QR_TOKEN_SECRET` - JWT signing secret (min 32 chars, **CHANGE IN PRODUCTION**)

---

## Security Considerations

✅ **Implemented:**
- HMAC-SHA256 JWT signing
- 5-minute token expiration
- Nonce-based replay protection
- One-time use tokens
- Rate limiting per device
- Comprehensive audit logging
- RBAC authorization
- No PII in QR code

⚠️ **Production Checklist:**
- [ ] Change `QR_TOKEN_SECRET` environment variable
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up monitoring/alerts for failed scans
- [ ] Review audit logs regularly
- [ ] Implement device registration
- [ ] Add IP-based rate limiting
- [ ] Enable request logging

---

## Support

For issues or questions:
1. Check audit logs: `qr_scan_audit_logs` table
2. Review application logs: `com.garbaking.orderservice.service.QRPaymentService`
3. Verify configuration: `application.yml`
4. Test with provided scripts: `test-qr-workflow.sh`

---

**Last Updated:** 2025-11-02
**API Version:** 1.0
**Service:** order-service:8082
