# Backend Integration Guide - Customer App

**Date:** November 16, 2025
**Status:** Phase 1 Complete (Authentication) ✅
**Progress:** ~25% Complete

---

## 📋 Overview

This document tracks the integration of the Garbaking Customer App frontend with the Spring Boot microservices backend via API Gateway.

### Architecture

```
Customer App (Vue 3)
    ↓ HTTP/WebSocket
API Gateway (Port 8080)
    ↓ Service Discovery
Microservices
    ├── User Service (8081) - Authentication & Profiles
    ├── Order Service (8082) - Orders & Payments
    ├── Inventory Service (8083) - Menu & Products
    ├── Operations Service (8085) - Operations
    └── Analytics Service (8086) - Analytics & Recommendations
```

---

## ✅ Phase 1: Authentication Integration (Complete)

### Files Created

#### 1. **`src/services/apiConfig.ts`** (300+ lines)

**Purpose:** Centralized API configuration and axios client

**Features:**
- API Gateway URL configuration
- Axios instance with interceptors
- JWT token auto-injection
- Global error handling
- Comprehensive endpoint mapping
- Service health checks

**Key Code:**
```typescript
// API Gateway URL
const API_GATEWAY_URL = 'http://localhost:8080'

// Axios instance with JWT interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401, 403, 500, etc.
    // Auto-redirect on unauthorized
    // Show toast notifications
  }
)
```

**Endpoints Mapped:**
```typescript
export const API_ENDPOINTS = {
  auth: { login, register, logout, validate, ... },
  user: { profile, updateProfile, changePassword, ... },
  menu: { public, categories, items, search, ... },
  orders: { create, list, track, cancel, ... },
  payment: { createIntent, confirm, methods, ... },
  analytics: { userStats, recommendations, ... },
  qr: { generatePayment, verifyPayment, ... }
}
```

#### 2. **`src/stores/auth.ts`** (Updated - 357 lines)

**Purpose:** Authentication state management integrated with backend

**Changes:**
- ✅ Updated imports to use `apiConfig`
- ✅ Updated `User` interface to match backend DTOs
- ✅ Updated `RegisterData` to include firstName/lastName
- ✅ Added `AuthResponse` interface
- ✅ Replaced axios calls with API Gateway endpoints
- ✅ Added `initialize()` method
- ✅ Added persistence configuration
- ✅ Improved error handling

**Methods Integrated:**
- `login()` → `/api/auth/login`
- `register()` → `/api/auth/register`
- `logout()` → `/api/auth/logout`
- `fetchUser()` → `/api/users/profile`
- `validateToken()` → `/api/auth/validate`
- `forgotPassword()` → `/api/auth/forgot-password`
- `resetPassword()` → `/api/auth/reset-password`
- `verifyCode()` → `/api/auth/verify-email`

**Example:**
```typescript
const login = async (credentials: LoginCredentials) => {
  const response = await api.post<AuthResponse>(
    API_ENDPOINTS.auth.login,
    { email: credentials.email, password: credentials.password }
  )

  setUser(response.user)
  setToken(response.token)

  return response
}
```

---

## ✅ Phase 2: Menu Integration (Complete)

### Files Updated

#### **`src/stores/menu.ts`** (Updated - 450 lines)

**Status:** ✅ Complete

**Changes Made:**
1. ✅ Updated imports to use `apiConfig`
2. ✅ Updated `fetchMenu()` to call `/api/menu/public`
3. ✅ Added `fetchCategories()` to call `/api/menu/categories`
4. ✅ Added `fetchMenuItem(id)` to call `/api/menu/items/:id`
5. ✅ Added `searchMenuItems(query)` to call `/api/menu/search`
6. ✅ Maintained cache functionality for offline support
7. ✅ Added comprehensive error handling

**Key Methods Integrated:**

```typescript
// Fetch full menu with categories and items
const fetchMenu = async (useCache = true) => {
  const response = await api.get<{ categories: any[]; items?: any[] }>(
    API_ENDPOINTS.menu.public
  )
  // Process categories and flatten menu items
  categories.value = response.categories
  menuItems.value = flattenMenuItems(response.categories)
}

// Fetch categories only
const fetchCategories = async () => {
  const response = await api.get<{ categories: Category[] }>(
    API_ENDPOINTS.menu.categories
  )
  categories.value = response.categories || response
}

// Fetch single menu item
const fetchMenuItem = async (itemId: string) => {
  const response = await api.get<MenuItem>(
    API_ENDPOINTS.menu.itemById(itemId)
  )
  // Update item in menuItems array
  return response
}

// Search menu items
const searchMenuItems = async (query: string) => {
  const response = await api.get<{ items: MenuItem[] }>(
    API_ENDPOINTS.menu.search,
    { params: { q: query } }
  )
  menuItems.value = response.items || response
}
```

**Backend Endpoints:**
- `GET /api/menu/public` - Get full menu with categories
- `GET /api/menu/categories` - Get categories only
- `GET /api/menu/items/:id` - Get single menu item
- `GET /api/menu/search?q={query}` - Search menu items

---

## 🚧 Phase 3: Order Integration (Next)

### Files to Update

#### **`src/stores/order.ts`**

**Current Status:** Using mock data

**Required Changes:**
1. Import `api` and `API_ENDPOINTS`
2. Update `createOrder()` to call `/api/orders`
3. Update `fetchOrders()` to call `/api/orders/history`
4. Update `trackOrder()` to call `/api/orders/:id/track`
5. Update `cancelOrder()` to call `/api/orders/:id/cancel`

**Example Implementation:**
```typescript
const createOrder = async (orderData: CreateOrderRequest) => {
  loading.value = true
  try {
    const response = await api.post<OrderResponse>(
      API_ENDPOINTS.orders.create,
      {
        items: orderData.items,
        deliveryAddress: orderData.address,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes
      }
    )

    currentOrder.value = response.order
    return response
  } catch (error) {
    console.error('[Order] Failed to create order:', error)
    throw error
  } finally {
    loading.value = false
  }
}
```

**Backend Endpoint:** `POST /api/orders`

**Request Body:**
```json
{
  "items": [
    { "menuItemId": 1, "quantity": 2, "customizations": [] }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Conakry",
    "coordinates": { "lat": 9.5092, "lng": -13.7122 }
  },
  "paymentMethod": "CASH",
  "notes": "Extra cheese please"
}
```

---

## 🚧 Phase 4: WebSocket Integration (Next)

### Files to Create/Update

#### **`src/services/websocket.ts`**

**Purpose:** Real-time updates via WebSocket/STOMP

**Features Needed:**
- Connect to WebSocket endpoint (`ws://localhost:8080/ws`)
- Subscribe to order updates (`/topic/orders/{orderId}`)
- Subscribe to delivery tracking (`/topic/delivery/{orderId}`)
- Handle connection/disconnection
- Automatic reconnection

**Example Implementation:**
```typescript
import { Client, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

class WebSocketService {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()

  connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        console.log('[WebSocket] Connected')
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected')
      },
      reconnectDelay: 5000
    })

    this.client.activate()
  }

  subscribeToOrder(orderId: string, callback: (message: any) => void) {
    if (!this.client) return

    const subscription = this.client.subscribe(
      `/topic/orders/${orderId}`,
      (message) => {
        const data = JSON.parse(message.body)
        callback(data)
      }
    )

    this.subscriptions.set(`order-${orderId}`, subscription)
  }

  disconnect() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
    this.subscriptions.clear()

    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
  }
}

export const websocket = new WebSocketService()
```

**Integration in OrderTracking.vue:**
```typescript
import { websocket } from '@/services/websocket'

onMounted(() => {
  websocket.connect()
  websocket.subscribeToOrder(orderId, (update) => {
    // Update order status in real-time
    orderStatus.value = update.status
    driverLocation.value = update.driverLocation
  })
})

onUnmounted(() => {
  websocket.disconnect()
})
```

---

## 📊 Integration Status

| Component | Status | Endpoints | Progress |
|-----------|--------|-----------|----------|
| **Auth Store** | ✅ Complete | `/api/auth/*` | 100% |
| **API Config** | ✅ Complete | All endpoints mapped | 100% |
| **Menu Store** | ✅ Complete | `/api/menu/*` | 100% |
| **Order Store** | ⏳ Pending | `/api/orders/*` | 0% |
| **Payment** | ⏳ Pending | `/api/payments/*` | 0% |
| **WebSocket** | ⏳ Pending | `ws://localhost:8080/ws` | 0% |
| **Analytics** | ⏳ Pending | `/api/analytics/*` | 0% |

**Overall Progress:** 37.5% (3/8 components)

---

## 🔧 Backend Service Requirements

### Currently Running Services (Required)

✅ **API Gateway** (Port 8080)
- Status: Must be running
- Health: `curl http://localhost:8080/actuator/health`

✅ **User Service** (Port 8081)
- Status: Running
- Endpoints: `/api/auth/*`, `/api/users/*`

⚠️ **Inventory Service** (Port 8083)
- Status: **NOT running** (MinIO dependency issue)
- Endpoints: `/api/menu/*`
- **Action Required:** Fix MinIO integration or make it optional

⚠️ **Order Service** (Port 8082)
- Status: Needs verification
- Endpoints: `/api/orders/*`, `/api/payments/*`

### Infrastructure Services

✅ **MySQL** (Port 3306) - Database
✅ **Kafka** (Port 9092) - Event streaming
✅ **Zookeeper** (Port 2181) - Kafka coordination
⚠️ **MinIO** (Port 9000) - Object storage (blocking Inventory Service)
✅ **Zipkin** (Port 9411) - Distributed tracing

---

## 🧪 Testing Guide

### 1. Test Authentication

```bash
# Start backend services
cd garbaking-backend
./gradlew :user-service:bootRun

# Start Customer App
cd frontend/customer-app
npm run dev
```

**Manual Test:**
1. Navigate to `http://localhost:3002`
2. Go to Login page
3. Test login with backend credentials
4. Check browser Network tab for API calls to `http://localhost:8080/api/auth/login`
5. Verify JWT token in localStorage
6. Verify user data is fetched

### 2. Test API Configuration

```typescript
// In browser console
import { api, checkBackendHealth } from '@/services/apiConfig'

// Check backend health
const healthy = await checkBackendHealth()
console.log('Backend healthy:', healthy)

// Test API call
const response = await api.get('/api/auth/health')
console.log(response)
```

### 3. Test Error Handling

- Try login with invalid credentials → Should show error toast
- Logout and try accessing protected route → Should redirect to login
- Make request while backend is down → Should show network error

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors

**Symptom:** Browser shows CORS policy errors

**Solution:** Verify API Gateway CORS configuration

```java
// api-gateway/src/main/java/*/config/CorsConfig.java
@Bean
public CorsWebFilter corsWebFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.addAllowedOrigin("http://localhost:3002"); // Customer App
    config.addAllowedMethod("*");
    config.addAllowedHeader("*");
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);

    return new CorsWebFilter(source);
}
```

### Issue 2: 503 Service Unavailable

**Symptom:** API calls return 503 errors

**Possible Causes:**
1. Backend service not running
2. Service not registered in Eureka
3. API Gateway can't route to service

**Solution:**
```bash
# Check Eureka dashboard
open http://localhost:8761

# Verify services are registered
# Check service health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health
```

### Issue 3: Inventory Service Won't Start

**Symptom:** MinIO connection timeout

**Current Workaround:** Use mock data until fixed

**Permanent Solution:** Make MinIO optional in `inventory-service`

```java
// Make MinIO initialization non-blocking
@EventListener(ApplicationReadyEvent.class)
public void initializeBucket() {
    try {
        // MinIO initialization
    } catch (Exception e) {
        log.warn("MinIO not available, image storage disabled", e);
        // Don't throw, let service start
    }
}
```

---

## 📝 Next Steps

### Immediate (This Session)
1. ✅ Update Menu Store with Inventory Service integration
2. ⏳ Update Order Store with Order Service integration
3. ⏳ Create WebSocket service for real-time updates
4. ⏳ Test end-to-end order flow

### Short-term (Next Session)
1. Payment gateway integration
2. Analytics integration
3. QR code payment integration
4. Error boundary components
5. Offline fallback handling

### Medium-term
1. E2E testing with backend
2. Performance optimization
3. Caching strategy (Redis)
4. Rate limiting
5. Request retry logic

---

## 🔑 Environment Variables

### Development (`.env.development`)

```env
# API Configuration
VITE_API_GATEWAY_URL=http://localhost:8080
VITE_API_URL=http://localhost:8080

# WebSocket
VITE_WS_URL=ws://localhost:8080/ws

# Feature Flags
VITE_USE_MOCK_DATA=false
VITE_ENABLE_WEBSOCKET=true
```

### Production (`.env.production`)

```env
# API Configuration
VITE_API_GATEWAY_URL=https://api.garbaking.com
VITE_API_URL=https://api.garbaking.com

# WebSocket
VITE_WS_URL=wss://api.garbaking.com/ws

# Feature Flags
VITE_USE_MOCK_DATA=false
VITE_ENABLE_WEBSOCKET=true
```

---

## 📚 API Documentation

### User Service API

**Base URL:** `http://localhost:8081` (via Gateway: `/api/auth/*`, `/api/users/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/validate` | Validate token |
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |

### Order Service API

**Base URL:** `http://localhost:8082` (via Gateway: `/api/orders/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders` | List user orders |
| GET | `/api/orders/{id}` | Get order details |
| PUT | `/api/orders/{id}` | Update order |
| DELETE | `/api/orders/{id}/cancel` | Cancel order |
| GET | `/api/orders/{id}/track` | Track order |

### Inventory Service API

**Base URL:** `http://localhost:8083` (via Gateway: `/api/menu/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu/public` | Get public menu |
| GET | `/api/menu/categories` | Get categories |
| GET | `/api/menu/items` | Get menu items |
| GET | `/api/menu/items/{id}` | Get item details |
| GET | `/api/menu/search` | Search menu |

---

## ✅ Checklist

### Phase 1: Authentication ✅
- [x] Create `apiConfig.ts`
- [x] Configure axios client
- [x] Map API endpoints
- [x] Update auth store
- [x] Test login/register
- [x] Test token persistence
- [x] Test error handling
- [x] Commit changes

### Phase 2: Menu Integration ✅
- [x] Update menu store
- [x] Replace mock data with API calls
- [x] Implement fetchMenu() for full menu
- [x] Implement fetchCategories() for categories only
- [x] Implement fetchMenuItem() for single item
- [x] Implement searchMenuItems() for search
- [x] Maintain cache functionality
- [x] Handle loading states
- [x] Handle errors with fallback to cache
- [x] Commit changes

### Phase 3: Order Integration ⏳
- [ ] Update order store
- [ ] Implement create order
- [ ] Implement order history
- [ ] Implement order tracking
- [ ] Test order flow
- [ ] Handle payment
- [ ] Commit changes

### Phase 4: WebSocket ⏳
- [ ] Create websocket service
- [ ] Connect to backend
- [ ] Subscribe to topics
- [ ] Update UI in real-time
- [ ] Handle disconnections
- [ ] Test live tracking
- [ ] Commit changes

---

**Status:** ✅ Phase 2 Complete
**Next:** Phase 3 - Order Integration
**Overall Progress:** 37.5% Complete (3/8 components)

---

*Last Updated: November 16, 2025*
