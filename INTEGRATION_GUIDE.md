# Garbaking POS - Spring Boot Integration Guide

Complete guide for integrating Vue.js frontends with the new Spring Boot microservices backend.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Customer App    │              │   Admin POS      │         │
│  │  (Vue.js)        │              │   (Vue.js)       │         │
│  │  Port: 3002      │              │   Port: 5173     │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
│           │                                 │                    │
│           └─────────────┬───────────────────┘                    │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                   HTTP + WebSocket
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│                       ↓         BACKEND LAYER                    │
│              ┌─────────────────┐                                 │
│              │  API Gateway    │                                 │
│              │  Port: 8080     │                                 │
│              │  (JWT Auth)     │                                 │
│              └────────┬────────┘                                 │
│                       │                                           │
│         ┌─────────────┼──────────────┐                          │
│         ↓             ↓              ↓                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │User Service│ │Order Service│ │ Inventory  │                  │
│  │ Port: 8081 │ │ Port: 8082  │ │  Service   │                  │
│  │            │ │ (WebSocket) │ │ Port: 8083 │                  │
│  └──────┬─────┘ └──────┬──────┘ └──────┬─────┘                  │
│         │              │                │                        │
└─────────┼──────────────┼────────────────┼────────────────────────┘
          │              │                │
          └──────────────┴────────────────┘
                         │
                    ┌────┴────┐
                    │  MySQL  │
                    │  Kafka  │
                    └─────────┘
```

## 📦 Services Overview

| Service | Port | Technology | Purpose |
|---------|------|-----------|----------|
| **Config Server** | 8888 | Spring Cloud Config | Centralized configuration |
| **Discovery Server** | 8761 | Eureka | Service registry |
| **API Gateway** | 8080 | Spring Cloud Gateway | Entry point + JWT auth |
| **User Service** | 8081 | Spring Boot | Authentication & user management |
| **Order Service** | 8082 | Spring Boot + WebSocket | Order management + real-time updates |
| **Inventory Service** | 8083 | Spring Boot | Menu items & categories |
| **MySQL** | 3306 | MySQL 8.0 | Persistent storage |
| **Kafka** | 9092 | Apache Kafka | Event streaming |
| **Zipkin** | 9411 | Zipkin | Distributed tracing |

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Required
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Git

# Verify installations
java --version
node --version
docker --version
```

### 2. Start Infrastructure

```bash
cd garbaking-backend

# Start MySQL, Kafka, Zookeeper, and Zipkin
docker-compose up -d

# Verify services are running
docker-compose ps

# Check MySQL is ready
docker exec -it garbaking-mysql mysql -uroot -prootpassword -e "SELECT 1"
```

### 3. Start Backend Services

**IMPORTANT:** Start services in this exact order:

```bash
# Terminal 1: Config Server (wait 10s)
cd garbaking-backend/config-server
./gradlew bootRun

# Terminal 2: Discovery Server (wait 20s)
cd garbaking-backend/discovery-server
./gradlew bootRun

# Terminal 3: API Gateway (wait 15s)
cd garbaking-backend/api-gateway
./gradlew bootRun

# Terminal 4: User Service
cd garbaking-backend/user-service
./gradlew bootRun

# Terminal 5: Inventory Service
cd garbaking-backend/inventory-service
./gradlew bootRun

# Terminal 6: Order Service (with WebSocket)
cd garbaking-backend/order-service
./gradlew bootRun
```

**Verification:**
- Eureka Dashboard: http://localhost:8761
- API Gateway Health: http://localhost:8080/actuator/health
- Config Server: http://localhost:8888/actuator/health

### 4. Start Frontend Applications

#### Customer App

```bash
cd frontend/customer-app

# Create .env file
cp .env.example .env

# Install dependencies (includes @stomp/stompjs and sockjs-client)
npm install

# Start dev server
npm run dev

# Access at: http://localhost:3002
```

#### Admin POS

```bash
cd frontend/admin-pos

# Create .env file
cp .env.example .env

# Install dependencies
npm install

# Start dev server
npm run dev

# Access at: http://localhost:5173
```

## 🔌 Frontend Integration

### Using the New API Service (Customer App)

```typescript
// Import the new API service
import api from '@/services/api-v2'

// 1. Authentication
const { token, user } = await api.auth.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  phone: '+1234567890'
})

// 2. Fetch Menu
const categories = await api.menu.getCategories()
const items = await api.menu.getMenuItems(categoryId)
const featured = await api.menu.getFeaturedItems()

// 3. Create Order
const order = await api.orders.createOrder({
  userId: user.id,
  customerName: user.name,
  customerPhone: user.phone,
  orderType: 'TAKEAWAY',
  paymentMethod: 'CARD',
  items: [
    {
      menuItemId: 1,
      menuItemName: 'Croissant',
      quantity: 2,
      unitPrice: 2.50
    }
  ],
  taxAmount: 0.50,
  discountAmount: 0
})

// 4. Track Order
const myOrders = await api.orders.getMyOrders()
const orderStatus = await api.orders.getOrder(orderId)
```

### Real-Time Updates with WebSocket

```typescript
// Import WebSocket service
import wsService from '@/services/websocket-stomp'

// 1. Connect to WebSocket
wsService.connect(
  () => {
    console.log('✅ Connected to order updates')
  },
  (error) => {
    console.error('❌ Connection error:', error)
  }
)

// 2. Subscribe to order status changes (all orders)
wsService.subscribeToOrderStatus((order) => {
  console.log('📊 Order status changed:', order.orderNumber, '->', order.status)
  // Update UI with new order status
  updateOrderInList(order)
})

// 3. Subscribe to user-specific orders
const userId = api.auth.getCurrentUser().id
wsService.subscribeToUserOrders(userId, (order) => {
  console.log('👤 Your order updated:', order.orderNumber)
  // Show notification to user
  showNotification(`Order ${order.orderNumber} is ${order.status}`)
})

// 4. Request browser notifications
await WebSocketService.requestNotificationPermission()

// 5. Cleanup on component unmount
onUnmounted(() => {
  wsService.disconnect()
})
```

### Environment Configuration

Create `.env` file in frontend apps:

```env
# Customer App / Admin POS
VITE_API_GATEWAY_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8082/ws/orders
VITE_STORE_ID=store_001
VITE_ENV=development
```

## 🔐 Authentication Flow

### 1. User Registration

```typescript
// Register new user
const response = await api.auth.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  phone: '+1234567890'
})

// Token automatically stored in localStorage
// User object stored for later use
console.log('Token:', response.token)
console.log('User:', response.user)
```

### 2. User Login

```typescript
// Login existing user
const response = await api.auth.login({
  email: 'john@example.com',
  password: 'password123'
})

// Token and user automatically stored
```

### 3. Authenticated Requests

All requests automatically include the JWT token:

```typescript
// Request interceptor adds token automatically
// No need to manually add Authorization header
const orders = await api.orders.getMyOrders()
```

### 4. Logout

```typescript
// Remove token and user from storage
api.auth.logout()

// Redirect to login page
router.push('/login')
```

## 📡 WebSocket Topics

### Broadcast Topics (All Subscribers)

| Topic | Description | Payload |
|-------|-------------|---------|
| `/topic/orders/created` | New order created | Full order object |
| `/topic/orders/updated` | Order updated | Updated order object |
| `/topic/orders/status` | Status changed | Order with new status |
| `/topic/orders/cancelled` | Order cancelled | Cancelled order |

### User-Specific Topics

| Topic | Description | Payload |
|-------|-------------|---------|
| `/user/{userId}/queue/orders` | Personal order updates | User's order updates |

## 🎯 Complete User Journey Example

### 1. Customer Registration & Login

```typescript
// Register
const { token, user } = await api.auth.register({
  name: 'Marie Dubois',
  email: 'marie@example.com',
  password: 'secure123',
  phone: '+33612345678'
})
```

### 2. Browse Menu

```typescript
// Get all categories with items
const { categories } = await api.menu.getPublicMenu()

// Or get items by category
const breadItems = await api.menu.getMenuItems(categoryId)

// Search for specific items
const searchResults = await api.menu.searchMenuItems('croissant')
```

### 3. Add Items to Cart (Client-Side)

```typescript
const cart = ref([])

function addToCart(menuItem, quantity) {
  cart.value.push({
    menuItemId: menuItem.id,
    menuItemName: menuItem.name,
    menuItemSku: menuItem.sku,
    quantity,
    unitPrice: menuItem.price
  })
}
```

### 4. Create Order

```typescript
const order = await api.orders.createOrder({
  userId: user.id,
  customerName: user.name,
  customerPhone: user.phone,
  customerEmail: user.email,
  orderType: 'TAKEAWAY',
  paymentMethod: 'CARD',
  items: cart.value,
  taxAmount: calculateTax(cart.value),
  discountAmount: 0,
  notes: 'Extra crispy please'
})

console.log('Order created:', order.orderNumber)
// Save order number for tracking
localStorage.setItem('currentOrderNumber', order.orderNumber)
```

### 5. Track Order in Real-Time

```typescript
// Connect to WebSocket
wsService.connect()

// Subscribe to user's orders
wsService.subscribeToUserOrders(user.id, (updatedOrder) => {
  if (updatedOrder.orderNumber === order.orderNumber) {
    // Update order status in UI
    currentOrder.value = updatedOrder

    // Show notification
    switch (updatedOrder.status) {
      case 'CONFIRMED':
        toast.success('Order confirmed! Preparing your items...')
        break
      case 'PREPARING':
        toast.info('Your order is being prepared 👨‍🍳')
        break
      case 'READY':
        toast.success('Your order is ready for pickup! 🔔')
        // Vibrate phone if supported
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200])
        }
        break
      case 'COMPLETED':
        toast.success('Enjoy your meal! 🍽️')
        break
    }
  }
})
```

### 6. View Order History

```typescript
const myOrders = await api.orders.getMyOrders()

// Display in UI
orderHistory.value = myOrders.sort((a, b) =>
  new Date(b.createdAt) - new Date(a.createdAt)
)
```

## 🎨 UI Components Examples

### Order Status Badge

```vue
<template>
  <span :class="statusClass(order.status)">
    {{ statusText(order.status) }}
  </span>
</template>

<script setup lang="ts">
function statusClass(status: string) {
  const classes = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-orange-100 text-orange-800',
    READY: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }
  return `px-3 py-1 rounded-full text-sm font-medium ${classes[status]}`
}

function statusText(status: string) {
  const texts = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    PREPARING: 'En préparation',
    READY: 'Prête',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée'
  }
  return texts[status] || status
}
</script>
```

### Real-Time Order Tracking

```vue
<template>
  <div class="order-tracking">
    <h2>Order #{{ order.orderNumber }}</h2>

    <!-- Progress Bar -->
    <div class="progress-steps">
      <div
        v-for="step in orderSteps"
        :key="step.status"
        :class="{ active: isStepActive(step.status), completed: isStepCompleted(step.status) }"
        class="step"
      >
        <div class="step-icon">{{ step.icon }}</div>
        <div class="step-label">{{ step.label }}</div>
      </div>
    </div>

    <!-- Order Details -->
    <div class="order-details">
      <p class="text-lg font-semibold">Status: {{ statusText(order.status) }}</p>
      <p v-if="order.estimatedPreparationTime">
        Temps estimé: {{ order.estimatedPreparationTime }} min
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/services/api-v2'
import wsService from '@/services/websocket-stomp'

const props = defineProps<{ orderNumber: string }>()
const order = ref(null)

const orderSteps = [
  { status: 'PENDING', icon: '📝', label: 'Reçue' },
  { status: 'CONFIRMED', icon: '✅', label: 'Confirmée' },
  { status: 'PREPARING', icon: '👨‍🍳', label: 'En préparation' },
  { status: 'READY', icon: '🔔', label: 'Prête' },
  { status: 'COMPLETED', icon: '🍽️', label: 'Servie' }
]

function isStepActive(stepStatus: string) {
  return order.value?.status === stepStatus
}

function isStepCompleted(stepStatus: string) {
  const currentIndex = orderSteps.findIndex(s => s.status === order.value?.status)
  const stepIndex = orderSteps.findIndex(s => s.status === stepStatus)
  return stepIndex < currentIndex
}

onMounted(async () => {
  // Fetch initial order status
  order.value = await api.orders.getOrderByNumber(props.orderNumber)

  // Connect to WebSocket for real-time updates
  wsService.connect()

  // Subscribe to order status changes
  wsService.subscribeToOrderStatus((updatedOrder) => {
    if (updatedOrder.orderNumber === props.orderNumber) {
      order.value = updatedOrder
    }
  })
})

onUnmounted(() => {
  wsService.disconnect()
})
</script>

<style scoped>
.progress-steps {
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
}

.step {
  flex: 1;
  text-align: center;
  opacity: 0.5;
}

.step.active, .step.completed {
  opacity: 1;
}

.step.completed .step-icon {
  color: green;
}

.step.active .step-icon {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
```

## 🐛 Troubleshooting

### Backend Issues

**Services not starting:**
```bash
# Check if ports are available
lsof -i:8080  # API Gateway
lsof -i:8081  # User Service
lsof -i:8082  # Order Service
lsof -i:8083  # Inventory Service

# Kill process if needed
kill -9 $(lsof -ti:8080)
```

**Services not registering with Eureka:**
```bash
# Check Eureka Dashboard
open http://localhost:8761

# Verify service logs
./gradlew :user-service:bootRun | grep "Eureka"
```

**Database connection errors:**
```bash
# Verify MySQL is running
docker ps | grep mysql

# Check MySQL logs
docker logs garbaking-mysql

# Test connection
docker exec -it garbaking-mysql mysql -uroot -prootpassword
```

### Frontend Issues

**API requests failing:**
```bash
# Check API Gateway is running
curl http://localhost:8080/actuator/health

# Verify CORS settings in API Gateway
# Check browser console for CORS errors
```

**WebSocket not connecting:**
```bash
# Verify Order Service is running
curl http://localhost:8082/actuator/health

# Check WebSocket endpoint
curl http://localhost:8082/ws/orders

# Check browser console for WebSocket errors
# Look for SockJS connection messages
```

**Dependencies not installed:**
```bash
cd frontend/customer-app
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [Spring Boot Microservices README](./garbaking-backend/README.md)
- [Migration Guide](./garbaking-backend/MIGRATION_GUIDE.md)
- [API Gateway Documentation](./garbaking-backend/api-gateway/README.md)
- [User Service Documentation](./garbaking-backend/user-service/README.md)
- [Order Service Documentation](./garbaking-backend/order-service/README.md)
- [Inventory Service Documentation](./garbaking-backend/inventory-service/README.md)

## 🎉 Success Indicators

You know everything is working when:

✅ Eureka Dashboard shows all 6 services (config, discovery, gateway, user, order, inventory)
✅ API Gateway health check returns 200 OK
✅ Customer app connects to WebSocket successfully
✅ Creating an order returns order number
✅ Order status changes appear in real-time (no page refresh needed)
✅ Toast notifications appear for status changes
✅ Browser notifications work (after permission granted)

## 🚀 Next Steps

1. **Production Deployment**
   - Configure Kubernetes manifests
   - Set up CI/CD pipeline
   - Configure production database
   - Add Redis caching
   - Set up monitoring (Prometheus/Grafana)

2. **Additional Features**
   - Kitchen Display System with real-time orders
   - Delivery tracking integration
   - Payment gateway integration
   - Analytics dashboard
   - Inventory alerts

3. **Performance Optimization**
   - Add Redis for session management
   - Implement API rate limiting
   - Add CDN for static assets
   - Database query optimization

---

**Built with ❤️ using Spring Boot, Vue.js, and WebSocket**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
