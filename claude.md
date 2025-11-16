# CLAUDE.md – Garbaking POS AI Assistant Guide

> **Comprehensive guide for AI assistants working on the Garbaking POS system**
> Last Updated: November 15, 2025

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Directory Structure](#-directory-structure)
4. [Technology Stack](#-technology-stack)
5. [Development Workflow](#-development-workflow)
6. [Key Conventions](#-key-conventions)
7. [Common Tasks](#-common-tasks)
8. [Testing Strategy](#-testing-strategy)
9. [Troubleshooting](#-troubleshooting)
10. [Port Allocation](#-port-allocation)
11. [Environment Configuration](#-environment-configuration)
12. [Git Workflow](#-git-workflow)

---

## 🎯 Project Overview

**Project Name:** Garbaking POS System
**Type:** Full Stack Point of Sale Application
**Architecture:** Monorepo with Spring Boot Microservices Backend + Vue.js Frontends
**Goal:** Build a modern, offline-first Point of Sale system for restaurants and food service businesses

### Key Features
- ✅ Offline-first design with IndexedDB persistence
- ✅ Multi-interface system (Admin/Customer/Kitchen/Kiosk)
- ✅ Real-time order tracking with WebSocket/STOMP
- ✅ Thermal printing and hardware integration
- ✅ Payment processing (Mobile Money, Card, QR codes)
- ✅ PWA capabilities for all frontends
- ✅ Multi-language support (EN/FR/AR)
- ✅ Analytics and reporting dashboard
- 🚧 Microservices backend with service discovery
- 🚧 Event-driven architecture with Kafka

### Project Status: ~65% Complete

**Completed:**
- ✅ Frontend applications (4 apps, 35+ screens total)
- ✅ User authentication service (Spring Boot)
- ✅ Infrastructure services (Config, Discovery, Gateway)
- ✅ Docker orchestration
- ✅ Enhanced logging and monitoring system
- ✅ Design system with W3C tokens

**In Progress:**
- 🚧 Order Service (models defined, controllers needed)
- 🚧 Inventory Service (MinIO integration blocking)
- 🚧 Operations Service (partial)
- 🚧 Analytics Service (partial)
- 🚧 Frontend-backend integration
- 🚧 Customer App expansion (11/35 screens done)

---

## 🏗 Architecture

### Architecture Pattern

**Monorepo + Microservices + Multi-Frontend**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Admin POS│ │ Customer │ │ KDS App  │ │  Kiosk App   │   │
│  │ Vue 3    │ │   App    │ │  Vue 3   │ │    Vue 3     │   │
│  │ Port 3000│ │ Port 3002│ │ Port 3003│ │  Port 3003   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
└───────┼───────────┼────────────┼───────────────┼───────────┘
        │           │            │               │
        └───────────┴────────────┴───────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │       API Gateway (Port 8080)          │
        │  JWT Auth • Routing • CORS • Limits   │
        └────────────────┬───────────────────────┘
                         │
        ┌────────────────┴────────────────────────┐
        │     Service Discovery (Eureka 8761)     │
        │           + Config Server (8888)        │
        └─────────────────┬───────────────────────┘
                          │
        ┌─────────────────┴──────────────────────────┐
        │           Business Microservices            │
        │  ┌──────────┐ ┌──────────┐ ┌────────────┐  │
        │  │  User    │ │  Order   │ │ Inventory  │  │
        │  │ Service  │ │ Service  │ │  Service   │  │
        │  │  8081    │ │  8082    │ │   8083     │  │
        │  └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
        │       │            │              │         │
        │  ┌────┴─────┐ ┌───┴──────┐ ┌─────┴──────┐  │
        │  │Operations│ │Analytics │ │   Common   │  │
        │  │  8085    │ │   8086   │ │    Libs    │  │
        │  └──────────┘ └──────────┘ └────────────┘  │
        └─────────────────────────────────────────────┘
                          │
        ┌─────────────────┴──────────────────────────┐
        │         Infrastructure Services             │
        │  MySQL • Kafka • Zookeeper • MinIO • Zipkin│
        │  3306    9092     2181       9000    9411  │
        └─────────────────────────────────────────────┘
```

### Data Flow

1. **Frontend** → Makes API calls to API Gateway (8080)
2. **API Gateway** → Validates JWT, routes to appropriate microservice
3. **Microservice** → Processes request, emits Kafka events if needed
4. **Kafka** → Async event processing between services
5. **Response** → Flows back through gateway to frontend

### Communication Patterns

- **Synchronous:** REST APIs (service-to-service via Eureka)
- **Asynchronous:** Kafka events (user.created, order.placed, etc.)
- **Real-time:** WebSocket/STOMP for live order updates
- **State Management:** Pinia stores with IndexedDB persistence

---

## 📂 Directory Structure

```
GARBAKING_POS/
├── frontend/                          # All Vue.js frontends
│   ├── admin-pos/                     # Staff management interface
│   │   ├── src/
│   │   │   ├── components/           # 50+ Vue components
│   │   │   │   ├── common/           # Reusable (Button, Card, Modal)
│   │   │   │   ├── dashboard/        # Dashboard widgets
│   │   │   │   ├── layout/           # Layout components
│   │   │   │   ├── loyalty/          # Loyalty program
│   │   │   │   ├── menu/             # Menu management
│   │   │   │   ├── orders/           # Order components
│   │   │   │   └── tables/           # Table management
│   │   │   ├── views/                # 12 main screens
│   │   │   ├── stores/               # 14 Pinia stores
│   │   │   ├── services/             # API services (axios)
│   │   │   ├── router/               # Vue Router config
│   │   │   ├── composables/          # Reusable composition functions
│   │   │   ├── types/                # TypeScript definitions
│   │   │   └── utils/                # Utility functions
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   ├── customer-app/                  # Mobile customer ordering
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── base/             # 22 foundation components
│   │   │   │   └── advanced/         # 22 complex components
│   │   │   ├── views/                # 11/35 screens implemented
│   │   │   ├── stores/               # 8 Pinia stores
│   │   │   ├── composables/          # Design system utilities
│   │   │   ├── locales/              # i18n (EN/FR)
│   │   │   └── services/             # API + mock services
│   │   ├── design_system.json        # W3C design tokens
│   │   └── create-screen.sh          # Screen generator
│   │
│   ├── kds-app/                       # Kitchen display system
│   │   ├── src/
│   │   │   ├── components/           # Kitchen-specific
│   │   │   ├── views/                # Kitchen screens
│   │   │   ├── stores/               # 10 Pinia stores
│   │   │   └── services/             # API services
│   │   └── package.json
│   │
│   └── kiosk-app/                     # Self-service kiosk
│       ├── src/
│       │   ├── views/                # 7 screens (complete flow)
│       │   │   ├── WelcomeScreen.vue
│       │   │   ├── LanguageModeScreen.vue
│       │   │   ├── MenuScreen.vue
│       │   │   ├── ItemCustomizationScreen.vue
│       │   │   ├── CartSummaryScreen.vue
│       │   │   ├── PaymentScreen.vue
│       │   │   └── ConfirmationScreen.vue
│       │   ├── stores/               # 4 Pinia stores
│       │   ├── components/           # IdleDetector, etc.
│       │   └── locales/              # EN/FR/AR
│       └── tailwind.config.js        # Touch-optimized
│
├── garbaking-backend/                 # Spring Boot microservices
│   ├── config-server/                # Centralized config (8888)
│   │   ├── src/main/java/com/garbaking/configserver/
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   └── config/               # Service configs
│   │   ├── build.gradle
│   │   └── Dockerfile
│   │
│   ├── discovery-server/             # Eureka registry (8761)
│   │   ├── src/main/java/com/garbaking/discoveryserver/
│   │   ├── build.gradle
│   │   └── Dockerfile
│   │
│   ├── api-gateway/                  # API Gateway (8080)
│   │   ├── src/main/java/com/garbaking/apigateway/
│   │   │   ├── config/               # Security, CORS, routing
│   │   │   ├── filter/               # JWT validation
│   │   │   └── ApiGatewayApplication.java
│   │   ├── build.gradle
│   │   └── Dockerfile
│   │
│   ├── common-libs/                  # Shared libraries
│   │   └── src/main/java/com/garbaking/common/
│   │       ├── observability/        # Monitoring, alerts
│   │       ├── dto/                  # Shared DTOs
│   │       ├── security/             # Shared security
│   │       └── util/                 # Common utilities
│   │
│   ├── user-service/                 # User auth & management (8081) ✅
│   │   ├── src/
│   │   │   ├── main/java/com/garbaking/userservice/
│   │   │   │   ├── config/           # Spring configs
│   │   │   │   ├── controller/       # REST endpoints
│   │   │   │   ├── dto/              # Request/response objects
│   │   │   │   ├── model/            # JPA entities (User)
│   │   │   │   ├── repository/       # JPA repositories
│   │   │   │   ├── service/          # Business logic
│   │   │   │   ├── security/         # JWT, BCrypt
│   │   │   │   └── util/             # JWT utilities
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── application-docker.yml
│   │   ├── build.gradle
│   │   └── Dockerfile
│   │
│   ├── order-service/                # Order processing (8082) 🚧
│   │   └── [Similar structure to user-service]
│   │
│   ├── inventory-service/            # Menu & stock (8083) ⚠️
│   │   └── [MinIO integration - startup issue]
│   │
│   ├── operations-service/           # Operations (8085) 🚧
│   │
│   ├── analytics-service/            # Analytics (8086) 🚧
│   │
│   ├── build.gradle                  # Root Gradle config
│   ├── settings.gradle               # Multi-module settings
│   ├── docker-compose.yml            # All services orchestration
│   └── gradlew                       # Gradle wrapper
│
├── old backend/                       # Legacy Node.js backend
│   └── [Archived - contains working auth/payment logic]
│
├── docker/                            # Additional Docker configs
│   └── nginx/                        # Nginx reverse proxy
│
├── docs/                              # Documentation (50+ files)
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   └── [Many implementation guides]
│
├── logs/                              # Application logs
│   ├── latest/                       # Symlink to current session
│   ├── YYYYMMDD_HHMMSS/             # Timestamped sessions
│   ├── archive/                      # Old sessions
│   └── reports/                      # Analysis reports
│
├── .claude/                           # Claude commands
│   └── commands/                     # Custom slash commands
│
├── .specify/                          # Specification framework
│   ├── templates/
│   ├── scripts/
│   └── memory/
│
├── package.json                       # Root package config
├── docker-compose.yml                 # Legacy frontend docker
├── .env.development                   # Development env vars
├── .gitignore
├── README.md                          # General documentation
├── CLAUDE.md                          # This file
└── *.sh                              # Operational scripts
    ├── start-all.sh                  # Start everything
    ├── start-backend-enhanced.sh     # Enhanced backend startup
    ├── dashboard.sh                  # Real-time monitoring
    ├── view-logs.sh                  # Log viewer
    ├── analyze-logs.sh               # Log analysis
    ├── stop-all.sh                   # Stop all services
    └── status.sh                     # Service status check
```

### Key File Locations

| Purpose | Location |
|---------|----------|
| **Frontend Entry Points** | `frontend/*/src/main.ts` |
| **Frontend Routes** | `frontend/*/src/router/index.ts` |
| **Pinia Stores** | `frontend/*/src/stores/*.ts` |
| **API Services** | `frontend/*/src/services/api.ts` |
| **Backend Entry Points** | `garbaking-backend/*/src/main/java/*Application.java` |
| **REST Controllers** | `garbaking-backend/*/src/main/java/*/controller/` |
| **JPA Entities** | `garbaking-backend/*/src/main/java/*/model/` |
| **Service Logic** | `garbaking-backend/*/src/main/java/*/service/` |
| **Spring Configs** | `garbaking-backend/*/src/main/resources/application.yml` |
| **Shared DTOs** | `garbaking-backend/common-libs/src/main/java/*/dto/` |
| **Design Tokens** | `frontend/customer-app/design_system.json` |
| **Environment Config** | `.env.development`, `frontend/*/.env` |
| **Docker Compose** | `garbaking-backend/docker-compose.yml` |

---

## 🛠 Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vue.js** | 3.x | Progressive framework with Composition API |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 4.x | Build tool & dev server |
| **Pinia** | 2.x | State management |
| **Vue Router** | 4.x | Routing |
| **TailwindCSS** | 3.x | Utility-first CSS |
| **Axios** | 1.x | HTTP client |
| **Socket.IO** | 4.x | Real-time communication |
| **STOMP** | - | WebSocket protocol |
| **IndexedDB (idb)** | - | Client-side storage |
| **LocalForage** | - | Offline data |
| **Vue I18n** | 9.x | Internationalization |
| **Vite PWA** | - | Progressive Web App |
| **Vitest** | - | Unit testing |
| **Playwright** | - | E2E testing |
| **Lucide Icons** | - | Icon library |
| **html5-qrcode** | - | QR code scanning |
| **Chart.js** | 4.x | Data visualization |
| **DayJS** | - | Date manipulation |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 3.x | Microservices framework |
| **Java** | 17+ | Programming language |
| **Gradle** | 8.x | Build automation |
| **Spring Cloud Gateway** | - | API Gateway |
| **Netflix Eureka** | - | Service discovery |
| **Spring Cloud Config** | - | Centralized config |
| **Spring Data JPA** | - | Data persistence |
| **MySQL** | 8.0 | Relational database |
| **Apache Kafka** | 7.5 | Event streaming |
| **MinIO** | - | Object storage (S3-compatible) |
| **Spring Security** | - | Authentication & authorization |
| **JWT** | - | Token-based auth |
| **BCrypt** | - | Password hashing |
| **Zipkin** | - | Distributed tracing |
| **Spring Actuator** | - | Monitoring & health |
| **JUnit 5** | - | Unit testing |
| **Testcontainers** | - | Integration testing |

### DevOps & Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Bash Scripts** | Automation & monitoring |
| **Git** | Version control |
| **GitHub** | Repository hosting |

---

## 🔄 Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/HusseinTALL/GARBAKING_POS.git
cd GARBAKING_POS

# 2. Install root dependencies
npm install

# 3. Setup frontend applications
cd frontend/admin-pos && npm install
cd ../customer-app && npm install
cd ../kds-app && npm install
cd ../kiosk-app && npm install
cd ../..

# 4. Verify Gradle installation
cd garbaking-backend
./gradlew --version

# 5. Make scripts executable
chmod +x *.sh

# 6. Start infrastructure
cd garbaking-backend
docker-compose up -d mysql kafka zookeeper minio zipkin
```

### Daily Development Workflow

#### Option 1: Full Stack (Recommended)

```bash
# Start everything with one command
./start-all.sh

# Monitor services
./dashboard.sh

# Check status
./status.sh
```

#### Option 2: Component-by-Component

**Backend:**
```bash
cd garbaking-backend

# Start infrastructure first
docker-compose up -d mysql kafka zookeeper minio

# Build all services
./gradlew clean build -x test

# Start services in order (wait 10-20s between each)
# Terminal 1: Config Server
cd config-server && ./gradlew bootRun

# Terminal 2: Discovery Server (wait for config to be ready)
cd discovery-server && ./gradlew bootRun

# Terminal 3: API Gateway (wait for discovery to be ready)
cd api-gateway && ./gradlew bootRun

# Terminal 4+: Business services
cd user-service && ./gradlew bootRun
cd order-service && ./gradlew bootRun
cd inventory-service && ./gradlew bootRun
```

**Frontend:**
```bash
# Terminal 1: Admin POS
cd frontend/admin-pos
npm run dev
# Access: http://localhost:3000

# Terminal 2: Customer App
cd frontend/customer-app
npm run dev
# Access: http://localhost:3002

# Terminal 3: KDS App
cd frontend/kds-app
npm run dev
# Access: http://localhost:3003

# Terminal 4: Kiosk App
cd frontend/kiosk-app
npm run dev
# Access: http://localhost:3003
```

### Service Startup Order (CRITICAL)

**MUST start in this order:**

1. **Infrastructure** (parallel)
   - MySQL (port 3306)
   - Kafka + Zookeeper (9092, 2181)
   - MinIO (9000, 9001)
   - Zipkin (9411)

2. **Config Server** (8888) → Wait 10 seconds

3. **Discovery Server** (8761) → Wait 20 seconds

4. **API Gateway** (8080) → Wait 10 seconds

5. **Business Services** (parallel)
   - user-service (8081)
   - order-service (8082)
   - inventory-service (8083)
   - operations-service (8085)
   - analytics-service (8086)

6. **Frontend Apps** (parallel)
   - All can start simultaneously

### Monitoring & Logs

```bash
# Real-time dashboard (auto-refresh every 2s)
./dashboard.sh

# View specific service logs
./view-logs.sh user-service

# View errors only
./view-logs.sh --errors --all

# Follow logs in real-time
./view-logs.sh --follow api-gateway

# Analyze logs
./analyze-logs.sh --full

# Generate HTML report
./analyze-logs.sh --export --format html
```

### Service Health Checks

```bash
# Eureka dashboard
open http://localhost:8761

# Zipkin tracing
open http://localhost:9411

# API Gateway health
curl http://localhost:8080/actuator/health

# User Service health
curl http://localhost:8081/actuator/health

# Check registered services
curl http://localhost:8761/eureka/apps
```

### Building & Testing

**Backend:**
```bash
cd garbaking-backend

# Build all services
./gradlew clean build

# Build without tests
./gradlew clean build -x test

# Build specific service
./gradlew :user-service:build

# Run tests
./gradlew test

# Run specific service tests
./gradlew :user-service:test

# Run single test class
./gradlew :user-service:test --tests UserServiceTest
```

**Frontend:**
```bash
# Build all frontends
npm run build

# Build specific app
cd frontend/admin-pos
npm run build

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

### Stopping Services

```bash
# Stop all services gracefully
./stop-all.sh

# Stop backend only
cd garbaking-backend
docker-compose down

# Stop specific service (Ctrl+C in terminal)
# Or kill by PID
ps aux | grep java
kill <PID>

# Restart everything
./restart-all.sh
```

---

## 🎨 Key Conventions

### Code Style & Formatting

#### Frontend (Vue.js/TypeScript)

**Vue Component Structure:**
```vue
<script setup lang="ts">
/**
 * ComponentName - Brief description of component purpose
 *
 * Features:
 * - Feature 1
 * - Feature 2
 */

import { ref, computed, onMounted } from 'vue'
import type { ComponentType } from '@/types'

// Props
interface Props {
  title: string
  count?: number
}
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// Emits
const emit = defineEmits<{
  update: [value: string]
  click: []
}>()

// State
const localState = ref<string>('')

// Computed
const displayValue = computed(() => {
  return `${props.title}: ${props.count}`
})

// Methods
const handleClick = () => {
  emit('click')
}

// Lifecycle
onMounted(() => {
  // Initialization
})
</script>

<template>
  <div class="component-wrapper">
    <h2 class="text-2xl font-bold">{{ displayValue }}</h2>
    <button @click="handleClick" class="btn btn-primary">
      Click Me
    </button>
  </div>
</template>

<style scoped>
/* Component-specific styles */
.component-wrapper {
  @apply p-4 bg-white rounded-lg shadow;
}
</style>
```

**Pinia Store Structure:**
```typescript
/**
 * useExampleStore - State management for [feature]
 *
 * Responsibilities:
 * - Manage [feature] state
 * - API integration for [feature]
 * - Persist data to IndexedDB
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExampleType } from '@/types'
import api from '@/services/api'

export const useExampleStore = defineStore('example', () => {
  // State
  const items = ref<ExampleType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const itemCount = computed(() => items.value.length)
  const hasItems = computed(() => items.value.length > 0)

  // Actions
  async function fetchItems() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/items')
      items.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch items:', err)
    } finally {
      loading.value = false
    }
  }

  function reset() {
    items.value = []
    error.value = null
  }

  return {
    // State
    items,
    loading,
    error,
    // Getters
    itemCount,
    hasItems,
    // Actions
    fetchItems,
    reset
  }
}, {
  persist: true // Enable persistence
})
```

**API Service Structure:**
```typescript
/**
 * API Service - [Service name]
 *
 * Provides API methods for [resource]
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  // GET methods
  async getItems() {
    return apiClient.get('/items')
  },

  async getItem(id: string) {
    return apiClient.get(`/items/${id}`)
  },

  // POST methods
  async createItem(data: any) {
    return apiClient.post('/items', data)
  },

  // PUT methods
  async updateItem(id: string, data: any) {
    return apiClient.put(`/items/${id}`, data)
  },

  // DELETE methods
  async deleteItem(id: string) {
    return apiClient.delete(`/items/${id}`)
  }
}
```

#### Backend (Spring Boot/Java)

**Controller Structure:**
```java
/**
 * ExampleController - REST API endpoints for [resource]
 *
 * Provides CRUD operations for [resource] management
 *
 * @author Garbaking Team
 * @version 1.0
 */

package com.garbaking.exampleservice.controller;

import com.garbaking.exampleservice.dto.ExampleRequest;
import com.garbaking.exampleservice.dto.ExampleResponse;
import com.garbaking.exampleservice.service.ExampleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/examples")
@RequiredArgsConstructor
@Slf4j
public class ExampleController {

    private final ExampleService exampleService;

    /**
     * Get all examples
     */
    @GetMapping
    public ResponseEntity<List<ExampleResponse>> getAllExamples() {
        log.info("Fetching all examples");
        List<ExampleResponse> examples = exampleService.findAll();
        return ResponseEntity.ok(examples);
    }

    /**
     * Get example by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExampleResponse> getExampleById(@PathVariable Long id) {
        log.info("Fetching example with id: {}", id);
        ExampleResponse example = exampleService.findById(id);
        return ResponseEntity.ok(example);
    }

    /**
     * Create new example
     */
    @PostMapping
    public ResponseEntity<ExampleResponse> createExample(@Valid @RequestBody ExampleRequest request) {
        log.info("Creating new example: {}", request);
        ExampleResponse created = exampleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update example
     */
    @PutMapping("/{id}")
    public ResponseEntity<ExampleResponse> updateExample(
            @PathVariable Long id,
            @Valid @RequestBody ExampleRequest request) {
        log.info("Updating example {}: {}", id, request);
        ExampleResponse updated = exampleService.update(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete example
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExample(@PathVariable Long id) {
        log.info("Deleting example with id: {}", id);
        exampleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

**Service Structure:**
```java
/**
 * ExampleService - Business logic for [resource]
 *
 * Handles:
 * - CRUD operations
 * - Business validation
 * - Kafka event publishing
 */

package com.garbaking.exampleservice.service;

import com.garbaking.exampleservice.dto.ExampleRequest;
import com.garbaking.exampleservice.dto.ExampleResponse;
import com.garbaking.exampleservice.model.Example;
import com.garbaking.exampleservice.repository.ExampleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExampleService {

    private final ExampleRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional(readOnly = true)
    public List<ExampleResponse> findAll() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExampleResponse findById(Long id) {
        Example example = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Example not found: " + id));
        return mapToResponse(example);
    }

    @Transactional
    public ExampleResponse create(ExampleRequest request) {
        Example example = mapToEntity(request);
        Example saved = repository.save(example);

        // Publish Kafka event
        kafkaTemplate.send("example.created", saved.getId().toString(), saved);
        log.info("Published example.created event for id: {}", saved.getId());

        return mapToResponse(saved);
    }

    @Transactional
    public ExampleResponse update(Long id, ExampleRequest request) {
        Example example = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Example not found: " + id));

        updateEntity(example, request);
        Example updated = repository.save(example);

        kafkaTemplate.send("example.updated", updated.getId().toString(), updated);

        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Example not found: " + id);
        }
        repository.deleteById(id);
        kafkaTemplate.send("example.deleted", id.toString(), id);
    }

    private ExampleResponse mapToResponse(Example entity) {
        return ExampleResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }

    private Example mapToEntity(ExampleRequest request) {
        return Example.builder()
                .name(request.getName())
                .build();
    }

    private void updateEntity(Example entity, ExampleRequest request) {
        entity.setName(request.getName());
    }
}
```

**Entity Structure:**
```java
/**
 * Example - JPA entity for [table_name]
 */

package com.garbaking.exampleservice.model;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "examples")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Example {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
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

### Naming Conventions

#### Frontend

- **Files:** `PascalCase.vue`, `camelCase.ts`
- **Components:** `PascalCase` (e.g., `OrderCard.vue`, `MenuList.vue`)
- **Composables:** `use` prefix (e.g., `useAuth.ts`, `useCart.ts`)
- **Stores:** `camelCase.ts` (e.g., `auth.ts`, `menu.ts`)
- **Types:** `PascalCase` interfaces (e.g., `interface User {}`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `API_URL`, `MAX_ITEMS`)
- **CSS Classes:** `kebab-case` or Tailwind utilities

#### Backend

- **Packages:** `lowercase` (e.g., `com.garbaking.userservice`)
- **Classes:** `PascalCase` (e.g., `UserService`, `OrderController`)
- **Interfaces:** `PascalCase` with `I` prefix optional (e.g., `UserRepository`)
- **Methods:** `camelCase` (e.g., `findById`, `createUser`)
- **Variables:** `camelCase` (e.g., `userId`, `orderTotal`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **DB Tables:** `snake_case` (e.g., `users`, `order_items`)
- **DB Columns:** `snake_case` (e.g., `created_at`, `user_id`)

### Git Commit Conventions

Follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc.
- `ci`: CI/CD changes

**Examples:**
```bash
git commit -m "feat(user-service): add user registration endpoint"
git commit -m "fix(admin-pos): resolve cart calculation bug"
git commit -m "docs(readme): update setup instructions"
git commit -m "refactor(customer-app): extract cart logic to composable"
git commit -m "test(order-service): add order creation tests"
```

### Code Comments

**When to comment:**
- ✅ Complex business logic
- ✅ Non-obvious algorithms
- ✅ Workarounds or hacks
- ✅ TODOs and FIXMEs
- ✅ File/class headers (purpose)
- ❌ Self-explanatory code
- ❌ Obvious variable names

**Examples:**
```typescript
// ✅ Good comment
// Calculate discount based on loyalty tier
// Bronze: 5%, Silver: 10%, Gold: 15%, Platinum: 20%
const discount = calculateDiscount(user.loyaltyTier, orderTotal)

// ❌ Bad comment
// Set user name
user.name = 'John'
```

---

## 📋 Common Tasks

### Adding a New Frontend Screen

```bash
# Navigate to app
cd frontend/customer-app

# Option 1: Use screen generator (Customer App only)
./create-screen.sh ScreenName

# Option 2: Manual creation
# 1. Create view file
touch src/views/ScreenName.vue

# 2. Add route to router
# Edit src/router/index.ts

# 3. Create store if needed
touch src/stores/screenName.ts

# 4. Create types if needed
# Edit src/types/index.ts
```

**View Template:**
```vue
<script setup lang="ts">
/**
 * ScreenName - [Description]
 *
 * Features:
 * - Feature 1
 * - Feature 2
 */

import { ref, onMounted } from 'vue'
import { useScreenNameStore } from '@/stores/screenName'

const store = useScreenNameStore()

onMounted(() => {
  // Initialize
})
</script>

<template>
  <div class="screen-container">
    <h1>Screen Name</h1>
    <!-- Content -->
  </div>
</template>

<style scoped>
.screen-container {
  @apply p-4;
}
</style>
```

**Add Route:**
```typescript
// src/router/index.ts
{
  path: '/screen-name',
  name: 'ScreenName',
  component: () => import('@/views/ScreenName.vue'),
  meta: { requiresAuth: true } // if needed
}
```

### Adding a New Backend Microservice

```bash
cd garbaking-backend

# 1. Create service directory
mkdir new-service
cd new-service

# 2. Initialize Gradle
# Create build.gradle, settings.gradle

# 3. Create source structure
mkdir -p src/main/java/com/garbaking/newservice
mkdir -p src/main/resources
mkdir -p src/test/java/com/garbaking/newservice

# 4. Create main application class
# NewServiceApplication.java

# 5. Create application.yml
# src/main/resources/application.yml

# 6. Add to root settings.gradle
# Add: include 'new-service'

# 7. Create Dockerfile
```

**Minimal Application:**
```java
package com.garbaking.newservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient
public class NewServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NewServiceApplication.class, args);
    }
}
```

**Minimal application.yml:**
```yaml
spring:
  application:
    name: new-service
  datasource:
    url: jdbc:mysql://localhost:3306/new_service_db
    username: root
    password: rootpassword

server:
  port: 8087

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
```

### Adding a New API Endpoint

**Backend:**
```java
// 1. Create DTO
package com.garbaking.userservice.dto;

@Data
@Builder
public class NewRequest {
    private String field1;
    private String field2;
}

@Data
@Builder
public class NewResponse {
    private Long id;
    private String field1;
    private String field2;
}

// 2. Add service method
@Service
public class UserService {
    public NewResponse processNew(NewRequest request) {
        // Implementation
        return NewResponse.builder()
                .id(1L)
                .field1(request.getField1())
                .build();
    }
}

// 3. Add controller endpoint
@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping("/new-endpoint")
    public ResponseEntity<NewResponse> newEndpoint(@RequestBody NewRequest request) {
        NewResponse response = userService.processNew(request);
        return ResponseEntity.ok(response);
    }
}
```

**Frontend:**
```typescript
// 1. Add to API service
export default {
  async newEndpoint(data: NewRequest): Promise<NewResponse> {
    const response = await apiClient.post('/users/new-endpoint', data)
    return response.data
  }
}

// 2. Use in component/store
const result = await api.newEndpoint({ field1: 'value' })
```

### Adding Database Migration

**Backend (Flyway/Liquibase):**
```sql
-- garbaking-backend/user-service/src/main/resources/db/migration/V2__add_new_table.sql

CREATE TABLE new_table (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_new_table_name ON new_table(name);
```

### Adding Kafka Event

**Producer:**
```java
@Service
public class ExampleService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishEvent(Example example) {
        kafkaTemplate.send("example.created", example.getId().toString(), example);
        log.info("Published event: example.created for id {}", example.getId());
    }
}
```

**Consumer:**
```java
@Service
@Slf4j
public class ExampleEventConsumer {

    @KafkaListener(topics = "example.created", groupId = "order-service-group")
    public void handleExampleCreated(String message) {
        log.info("Received event: example.created - {}", message);
        // Process event
    }
}
```

### Adding Environment Variable

**Frontend:**
```bash
# 1. Add to .env.development
VITE_NEW_CONFIG=value

# 2. Use in code
const newConfig = import.meta.env.VITE_NEW_CONFIG
```

**Backend:**
```yaml
# application.yml
app:
  new-config: ${NEW_CONFIG:default-value}
```

```java
// Use in code
@Value("${app.new-config}")
private String newConfig;
```

### Running Tests

**Backend:**
```bash
# All tests
./gradlew test

# Specific service
./gradlew :user-service:test

# With coverage
./gradlew test jacocoTestReport

# Integration tests only
./gradlew integrationTest
```

**Frontend:**
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

---

## 🧪 Testing Strategy

### Backend Testing

**Test Structure:**
```
user-service/
└── src/
    └── test/java/com/garbaking/userservice/
        ├── controller/
        │   └── UserControllerTest.java
        ├── service/
        │   └── UserServiceTest.java
        ├── repository/
        │   └── UserRepositoryTest.java
        └── integration/
            └── UserIntegrationTest.java
```

**Unit Test Example:**
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldCreateUser() {
        // Given
        UserRequest request = UserRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        User user = User.builder()
                .id(1L)
                .email(request.getEmail())
                .build();

        when(repository.save(any(User.class))).thenReturn(user);

        // When
        UserResponse response = userService.create(request);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("test@example.com", response.getEmail());
        verify(kafkaTemplate).send(eq("user.created"), anyString(), any());
    }
}
```

**Integration Test Example:**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class UserIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("test_db")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository repository;

    @Test
    void shouldRegisterUser() throws Exception {
        String requestBody = """
                {
                    "email": "test@example.com",
                    "password": "password123",
                    "firstName": "John",
                    "lastName": "Doe"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"));

        assertEquals(1, repository.count());
    }
}
```

### Frontend Testing

**Unit Test Example (Vitest):**
```typescript
// stores/__tests__/auth.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import api from '@/services/api'

vi.mock('@/services/api')

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should login successfully', async () => {
    const store = useAuthStore()
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: { id: 1, email: 'test@example.com' }
      }
    }

    vi.mocked(api.login).mockResolvedValue(mockResponse)

    await store.login('test@example.com', 'password')

    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.email).toBe('test@example.com')
  })
})
```

**Component Test Example:**
```typescript
// components/__tests__/OrderCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderCard from '../OrderCard.vue'

describe('OrderCard', () => {
  it('renders order details correctly', () => {
    const order = {
      id: '123',
      total: 2500,
      status: 'pending'
    }

    const wrapper = mount(OrderCard, {
      props: { order }
    })

    expect(wrapper.text()).toContain('123')
    expect(wrapper.text()).toContain('2500')
    expect(wrapper.find('.status-badge').text()).toBe('pending')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(OrderCard, {
      props: { order: { id: '123', total: 100, status: 'pending' } }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
```

**E2E Test Example (Playwright):**
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/login')

    await page.fill('input[name="email"]', 'admin@garbaking.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('http://localhost:3000/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login')

    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('Invalid credentials')
  })
})
```

### Test Coverage Goals

- **Backend:** ≥80% line coverage, ≥70% branch coverage
- **Frontend:** ≥70% coverage for business logic (stores, services)
- **E2E:** Cover critical user flows (auth, order placement, payment)

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Backend Issues

**1. Service Won't Start - Port Already in Use**
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port in application.yml
server:
  port: 8090
```

**2. Service Can't Connect to Eureka**
```bash
# Check Eureka is running
curl http://localhost:8761

# Verify eureka.client.serviceUrl in application.yml
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/

# Check service registration
curl http://localhost:8761/eureka/apps
```

**3. Database Connection Failed**
```bash
# Check MySQL is running
docker ps | grep mysql

# Start MySQL if not running
cd garbaking-backend
docker-compose up -d mysql

# Verify connection
mysql -h localhost -P 3306 -u root -prootpassword

# Check application.yml datasource config
```

**4. Kafka Connection Issues**
```bash
# Check Kafka and Zookeeper
docker ps | grep kafka

# Start if not running
docker-compose up -d zookeeper kafka

# Verify Kafka is ready (wait 30s after start)
docker logs <kafka-container-id>
```

**5. MinIO Connection Timeout (Inventory Service)**
```bash
# Current known issue - MinIO takes time to initialize
# Workaround: Start MinIO first, wait 30s, then start inventory-service

docker-compose up -d minio
sleep 30
cd inventory-service && ./gradlew bootRun

# Or disable MinIO temporarily in application.yml
```

**6. Gradle Build Fails**
```bash
# Clean build
./gradlew clean

# Build without tests
./gradlew build -x test

# Clear Gradle cache
rm -rf ~/.gradle/caches/

# Use Gradle daemon
./gradlew --daemon build
```

#### Frontend Issues

**1. npm install Fails**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If specific dependency fails, try
npm install --legacy-peer-deps
```

**2. API Calls Return 503 Service Unavailable**
```bash
# Check backend services are running
./status.sh

# Verify API Gateway is running
curl http://localhost:8080/actuator/health

# Check Eureka for registered services
open http://localhost:8761

# Verify API_URL in .env
VITE_API_URL=http://localhost:8080
```

**3. CORS Errors**
```java
// Verify CORS config in API Gateway
// api-gateway/src/main/java/*/config/CorsConfig.java

@Configuration
public class CorsConfig {
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:3002");
        config.addAllowedOrigin("http://localhost:3003");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}
```

**4. TypeScript Errors**
```bash
# Check TypeScript version
npx tsc --version

# Regenerate types
npm run type-check

# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

**5. Pinia Store Not Persisting**
```typescript
// Verify persist option in store
export const useExampleStore = defineStore('example', () => {
  // ...
}, {
  persist: true // Must be enabled
})

// Check browser IndexedDB/localStorage
// Open DevTools → Application → Storage
```

**6. WebSocket Connection Failed**
```bash
# Verify Socket.IO server is running
# Check backend logs for WebSocket initialization

# Verify URL in frontend
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080')

# Check firewall/proxy settings
```

#### Docker Issues

**1. Docker Compose Services Won't Start**
```bash
# Check Docker is running
docker info

# Check docker-compose.yml syntax
docker-compose config

# View logs
docker-compose logs <service-name>

# Restart services
docker-compose restart

# Nuclear option - rebuild
docker-compose down -v
docker-compose up -d --build
```

**2. MySQL Container Fails to Start**
```bash
# Check if port 3306 is available
lsof -i :3306

# Remove existing container
docker-compose down mysql
docker volume rm <mysql-volume>

# Restart
docker-compose up -d mysql
```

**3. Kafka Container Issues**
```bash
# Kafka requires Zookeeper to be healthy first
docker-compose up -d zookeeper
sleep 10
docker-compose up -d kafka

# Check logs
docker-compose logs -f kafka

# Verify Zookeeper connection
docker exec -it <kafka-container> kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### Debugging Tips

**Backend:**
```bash
# Enable debug logging in application.yml
logging:
  level:
    root: INFO
    com.garbaking: DEBUG
    org.springframework.web: DEBUG

# Run with debug mode
./gradlew bootRun --debug-jvm

# Attach debugger on port 5005
```

**Frontend:**
```typescript
// Enable Vue DevTools
// Install: https://devtools.vuejs.org/

// Debug API calls
axios.interceptors.request.use(config => {
  console.log('Request:', config)
  return config
})

axios.interceptors.response.use(response => {
  console.log('Response:', response)
  return response
})

// Debug Pinia store
const store = useExampleStore()
console.log('Store state:', store.$state)
```

**Logs:**
```bash
# View all logs
./view-logs.sh --all

# View errors only
./view-logs.sh --errors

# Follow specific service
./view-logs.sh --follow user-service

# Search logs
./view-logs.sh --search "exception"

# Generate analysis report
./analyze-logs.sh --full --export
```

---

## 🔌 Port Allocation

### Infrastructure Services

| Service | Port(s) | Status | Access |
|---------|---------|--------|--------|
| MySQL | 3306 | ✅ Running | `mysql -h localhost -P 3306 -u root -prootpassword` |
| Kafka | 9092 | ✅ Running | Internal |
| Zookeeper | 2181 | ✅ Running | Internal |
| MinIO API | 9000 | ✅ Running | `http://localhost:9000` |
| MinIO Console | 9001 | ✅ Running | `http://localhost:9001` (admin/adminpassword) |
| Zipkin | 9411 | ✅ Running | `http://localhost:9411` |

### Backend Microservices

| Service | Port | Status | Health Check |
|---------|------|--------|--------------|
| Config Server | 8888 | ✅ Running | `http://localhost:8888/actuator/health` |
| Discovery Server | 8761 | ✅ Running | `http://localhost:8761` (Eureka Dashboard) |
| API Gateway | 8080 | ⚠️ Partial | `http://localhost:8080/actuator/health` |
| User Service | 8081 | ✅ Complete | `http://localhost:8081/actuator/health` |
| Order Service | 8082 | 🚧 In Progress | `http://localhost:8082/actuator/health` |
| Inventory Service | 8083 | ❌ MinIO Issue | `http://localhost:8083/actuator/health` |
| Operations Service | 8085 | 🚧 Partial | `http://localhost:8085/actuator/health` |
| Analytics Service | 8086 | 🚧 Partial | `http://localhost:8086/actuator/health` |

### Frontend Applications

| Application | Port | Status | Access |
|-------------|------|--------|--------|
| Admin POS | 3000 | ✅ Working | `http://localhost:3000` |
| Customer App | 3002 | ✅ Working | `http://localhost:3002` |
| KDS App | 3003 | ✅ Working | `http://localhost:3003` |
| Kiosk App | 3003 | ✅ Working | `http://localhost:3003` (alternate port if needed) |

### Legacy Services (Not in active use)

| Service | Port | Status |
|---------|------|--------|
| Old Node.js Backend | 8000 | ⚪ Archived |
| PostgreSQL | 5432 | ⚪ Archived |
| Redis | 6379 | ⚪ Archived |

### Port Conflict Resolution

If you encounter port conflicts:

```bash
# Find what's using a port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port in config
# Backend: src/main/resources/application.yml
server:
  port: 8090

# Frontend: vite.config.ts
export default defineConfig({
  server: {
    port: 3001
  }
})
```

---

## ⚙️ Environment Configuration

### Frontend Environment Variables

**Root `.env.development`:**
```env
# API Configuration
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080

# Application Info
VITE_APP_TITLE=Garbaking Admin POS
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEBUG=true

# Store Configuration
VITE_STORE_ID=store_001
VITE_STORE_NAME=Garbaking Restaurant
VITE_CURRENCY=FCFA
VITE_TAX_RATE=0.10

# Pagination
VITE_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=100

# Session
VITE_SESSION_TIMEOUT=3600000
```

**Per-Frontend `.env` Files:**
Each frontend app can override these in their own `.env` file:
- `frontend/admin-pos/.env`
- `frontend/customer-app/.env`
- `frontend/kds-app/.env`
- `frontend/kiosk-app/.env`

### Backend Environment Variables

**application.yml (Spring Boot):**
```yaml
# Config Server (8888)
spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        native:
          search-locations: classpath:/config
  profiles:
    active: native

server:
  port: 8888

---
# User Service (8081)
spring:
  application:
    name: user-service
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:3306/garbaking_users
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:rootpassword}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: ${DDL_AUTO:update}
    show-sql: ${SHOW_SQL:false}
  kafka:
    bootstrap-servers: ${KAFKA_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

server:
  port: ${SERVER_PORT:8081}

jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-change-in-production}
  expiration: ${JWT_EXPIRATION:86400000}

eureka:
  client:
    serviceUrl:
      defaultZone: ${EUREKA_URL:http://localhost:8761/eureka/}
  instance:
    preferIpAddress: true

logging:
  level:
    root: INFO
    com.garbaking: ${LOG_LEVEL:DEBUG}
```

**Docker Profile (application-docker.yml):**
```yaml
spring:
  datasource:
    url: jdbc:mysql://mysql:3306/garbaking_users
  kafka:
    bootstrap-servers: kafka:9092

eureka:
  client:
    serviceUrl:
      defaultZone: http://discovery-server:8761/eureka/
```

### Docker Environment

**docker-compose.yml environment sections:**
```yaml
services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: garbaking_db
      TZ: Africa/Conakry

  kafka:
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  minio:
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: adminpassword

  user-service:
    environment:
      SPRING_PROFILES_ACTIVE: docker
      DB_HOST: mysql
      KAFKA_SERVERS: kafka:9092
      EUREKA_URL: http://discovery-server:8761/eureka/
```

### Secrets Management

**IMPORTANT: Never commit secrets to Git**

```bash
# .gitignore already includes:
.env
.env.local
.env.*.local
*.env
```

**For Production:**
- Use environment variables from CI/CD
- Use secrets management (AWS Secrets Manager, Vault, etc.)
- Rotate JWT secrets regularly
- Use strong database passwords
- Enable SSL/TLS for all services

**Generating JWT Secret:**
```bash
# Generate 256-bit secret
openssl rand -base64 32
```

---

## 🔀 Git Workflow

### Branch Strategy

**Current Branch:**
```
claude/claude-md-mi0x7nr33xp2rt44-01JwtkMndyTMCroVf2EJfgYN
```

**Branch Naming Convention:**
- `claude/*` - AI assistant feature branches
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `refactor/*` - Refactoring branches
- `docs/*` - Documentation branches

### Working with Git

**Check Status:**
```bash
git status
git log --oneline -10
git branch -a
```

**Making Changes:**
```bash
# Stage changes
git add <files>

# Commit with conventional commit message
git commit -m "feat(user-service): add password reset endpoint"

# Push to current branch
git push -u origin claude/claude-md-mi0x7nr33xp2rt44-01JwtkMndyTMCroVf2EJfgYN
```

**Creating Pull Request:**
```bash
# Ensure changes are committed and pushed
git push -u origin <branch-name>

# Create PR using GitHub CLI (if available)
gh pr create --title "Feature: Add user management" --body "Description here"

# Or create PR via GitHub web interface
```

### Pre-commit Checklist

Before committing:
- ✅ Code compiles/builds without errors
- ✅ Tests pass (`./gradlew test`, `npm test`)
- ✅ No linting errors (`./gradlew check`, `npm run lint`)
- ✅ Code is formatted (`npm run format`)
- ✅ Environment variables not committed
- ✅ Sensitive data removed (passwords, tokens, keys)
- ✅ Console.logs removed (or replaced with proper logging)
- ✅ TODO comments addressed or tracked
- ✅ Documentation updated if needed

### Merge Conflicts

```bash
# If you encounter merge conflicts

# 1. Fetch latest changes
git fetch origin main

# 2. Rebase on main
git rebase origin/main

# 3. Resolve conflicts in files
# Edit conflicting files, remove conflict markers

# 4. Stage resolved files
git add <resolved-files>

# 5. Continue rebase
git rebase --continue

# 6. Force push if needed (be careful!)
git push -f origin <branch-name>
```

---

## 📚 Additional Resources

### Documentation Files

**Implementation Guides:**
- `CUSTOMER-APP-PROJECT-SUMMARY.md` - Customer app overview
- `CUSTOMER-APP-IMPLEMENTATION-GUIDE.md` - Screen-by-screen guide
- `KIOSK-APP-SUMMARY.md` - Complete kiosk implementation
- `MENU_MANAGEMENT_IMPLEMENTATION_PLAN.md` - Menu feature planning

**Technical Docs:**
- `LOGGING_README.md` - Enhanced logging system guide
- `INTEGRATION_GUIDE.md` - Service integration patterns
- `BACKEND_TROUBLESHOOTING.md` - Backend debugging
- `BACKEND-SERVICE-STATUS.md` - Service status tracking

**Operations:**
- `QUICK_START.md` - Quick start guide
- `SCRIPTS-README.md` - Scripts documentation
- `STARTUP.md` - Startup procedures
- `RUN_ME.md` - First-time setup

### External Documentation

- **Vue.js**: https://vuejs.org/guide/
- **Pinia**: https://pinia.vuejs.org/
- **Spring Boot**: https://spring.io/projects/spring-boot
- **Spring Cloud**: https://spring.io/projects/spring-cloud
- **Kafka**: https://kafka.apache.org/documentation/
- **TailwindCSS**: https://tailwindcss.com/docs

---

## 🎯 Quick Reference

### Service URLs

```bash
# Frontend Apps
http://localhost:3000  # Admin POS
http://localhost:3002  # Customer App
http://localhost:3003  # KDS/Kiosk App

# Backend Services
http://localhost:8761  # Eureka Dashboard
http://localhost:8888  # Config Server
http://localhost:8080  # API Gateway
http://localhost:8081  # User Service
http://localhost:9411  # Zipkin Tracing
http://localhost:9001  # MinIO Console

# Infrastructure
http://localhost:3306  # MySQL
http://localhost:9092  # Kafka
```

### Essential Commands

```bash
# Start everything
./start-all.sh

# Monitor services
./dashboard.sh

# Check status
./status.sh

# View logs
./view-logs.sh --all

# Stop everything
./stop-all.sh

# Build backend
cd garbaking-backend && ./gradlew build

# Build frontend
npm run build

# Run tests
./gradlew test && npm test
```

### Key Contacts & Info

- **Repository**: https://github.com/HusseinTALL/GARBAKING_POS
- **Current Branch**: `claude/claude-md-mi0x7nr33xp2rt44-01JwtkMndyTMCroVf2EJfgYN`
- **Project Phase**: Core Features Development (Phase 6)
- **Completion**: ~65%

---

## 📝 Changelog

### 2025-11-15
- ✅ Created comprehensive CLAUDE.md guide
- ✅ Documented complete architecture
- ✅ Added troubleshooting section
- ✅ Documented all conventions and workflows

### Previous Major Updates
- 2025-09-22: Initial project structure
- 2025-09-22: Frontend scaffolding complete
- 2025-09-22: Backend microservices started
- 2025-10-15: User service implementation complete
- 2025-11-01: Enhanced logging system implemented

---

## 💡 Tips for AI Assistants

1. **Always check service status** before making changes
2. **Read relevant documentation** in `/docs` folder
3. **Follow naming conventions** strictly
4. **Test locally** before committing
5. **Update documentation** when adding features
6. **Use existing patterns** - check similar implementations first
7. **Respect the architecture** - don't bypass API Gateway
8. **Check logs** when debugging - `./view-logs.sh` is your friend
9. **Ask questions** if requirements are unclear
10. **Keep it simple** - prefer simplicity over complexity

---

**End of CLAUDE.md**

> This document is maintained by AI assistants working on the Garbaking POS project.
> Last updated: November 15, 2025
> Version: 2.0
