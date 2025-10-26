# Garbaking POS - Fastify to Spring Boot Migration Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture Comparison](#architecture-comparison)
3. [Technology Stack](#technology-stack)
4. [Migration Roadmap](#migration-roadmap)
5. [Setup Instructions](#setup-instructions)
6. [Service Details](#service-details)
7. [Data Migration](#data-migration)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide provides a complete roadmap for migrating the Garbaking POS backend from:
- **From:** Fastify (Node.js + TypeScript) with SQLite/Prisma
- **To:** Spring Boot (Java 17+) Microservices with MySQL/JPA

**Migration Duration:** 6-8 weeks (3-person team)
**Risk Level:** High (Complete rewrite)
**Recommendation:** Proceed only if Fastify limitations are blocking critical features

---

## 🏗️ Architecture Comparison

### Current Architecture (Fastify)
```
Frontend (Vue.js)
    ↓
Fastify Backend (Monolith)
    ├── Auth Routes
    ├── Menu Routes
    ├── Order Routes
    └── SQLite Database
```

### Target Architecture (Spring Boot Microservices)
```
Frontend (Vue.js)
    ↓
API Gateway (Spring Cloud Gateway) :8080
    ├── Discovery Client (Eureka)
    └── JWT Filter
        ↓
    ┌───────────┬──────────────┬────────────────┐
    ↓           ↓              ↓                ↓
User Service  Order Service  Inventory Service  ...
:8081         :8082          :8083
    ↓           ↓              ↓
  MySQL       MySQL          MySQL
    ↓           ↓              ↓
        Kafka Message Bus
            ↓
    Zipkin (Tracing) / Prometheus (Metrics)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Language** | Java 17+ | Type safety, mature ecosystem, enterprise support |
| **Framework** | Spring Boot 3.2.0 | Industry standard, extensive features, excellent documentation |
| **Build Tool** | Gradle 8.x | Modern, flexible, better than Maven for multi-module projects |
| **Database** | MySQL 8.0 | ACID compliance, proven reliability, better for production |
| **ORM** | Spring Data JPA / Hibernate | Powerful abstractions, avoids N+1 queries, lazy loading |
| **Service Discovery** | Eureka | Netflix-proven, Spring Cloud native |
| **Load Balancing** | Spring Cloud LoadBalancer | Modern replacement for Ribbon |
| **API Gateway** | Spring Cloud Gateway | Reactive, non-blocking, filters support |
| **Messaging** | Apache Kafka | High throughput, event sourcing, microservice communication |
| **Security** | Spring Security + JWT | Industry standard, extensive features |
| **Tracing** | Zipkin + Sleuth | Distributed tracing for debugging |
| **Monitoring** | Prometheus + Grafana | Metrics collection and visualization |
| **Containerization** | Docker + Docker Compose | Consistent environments, easy deployment |
| **Testing** | JUnit 5 + Testcontainers | Modern testing with real dependencies |

---

## 📅 Migration Roadmap

### Phase 1: Infrastructure Setup (Week 1-2)

#### Week 1: Core Infrastructure
- [ ] Set up multi-module Gradle project
- [ ] Create Config Server
- [ ] Create Discovery Server (Eureka)
- [ ] Create API Gateway
- [ ] Set up Docker Compose with MySQL, Kafka, Zipkin
- [ ] Configure CI/CD pipeline (GitHub Actions)

#### Week 2: Foundational Services
- [ ] Create common-libs module
  - JWT utilities
  - Exception handlers
  - DTO base classes
  - Kafka event models
- [ ] Set up database schemas for each service
- [ ] Configure Kafka topics
- [ ] Set up monitoring (Prometheus/Grafana)

**Deliverables:**
- Working infrastructure (Config, Discovery, Gateway)
- Database containers running
- Kafka message bus operational
- Monitoring dashboards configured

---

### Phase 2: User Service Migration (Week 3)

- [ ] Design User entity and database schema
- [ ] Implement UserRepository with Spring Data JPA
- [ ] Create UserService with business logic
- [ ] Implement AuthController (login, register, token refresh)
- [ ] Implement UserController (CRUD operations)
- [ ] Configure JWT generation and validation
- [ ] Add Kafka publishers for user events
- [ ] Write unit tests (JUnit 5)
- [ ] Write integration tests (Testcontainers)
- [ ] Update frontend to call new auth endpoints

**Migration Steps:**
1. Export users from SQLite (`SELECT * FROM users`)
2. Transform data to match new schema
3. Import into MySQL user_service database
4. Update Vue.js Axios baseURL to Gateway
5. Test authentication flow end-to-end

---

### Phase 3: Order Service Migration (Week 4-5)

- [ ] Design Order, OrderItem entities
- [ ] Handle relationships (Order ↔ OrderItem, Order ↔ User)
- [ ] Avoid infinite recursion with `@JsonIgnore` and DTOs
- [ ] Implement OrderRepository
- [ ] Create OrderService with state machine
- [ ] Implement OrderController (CRUD, status updates)
- [ ] Add Kafka publishers (order_created, order_updated events)
- [ ] Add Kafka consumers (listen to inventory updates)
- [ ] Implement Resilience4j circuit breakers
- [ ] Write comprehensive tests
- [ ] Update frontend order management UI

**Key Challenges:**
- **Infinite Recursion:** Use DTOs instead of returning entities directly
- **Bidirectional Relationships:** Mark one side with `@JsonIgnore`
- **Transaction Management:** Use `@Transactional` properly

---

### Phase 4: Inventory Service Migration (Week 5-6)

- [ ] Design MenuItem, Category, InventoryItem entities
- [ ] Implement repositories
- [ ] Create services with stock management logic
- [ ] Implement controllers (menu, categories, inventory)
- [ ] Add Kafka integration (consume order events, update stock)
- [ ] Implement image upload (store in S3 or filesystem)
- [ ] Add caching (Redis) for frequently accessed menu items
- [ ] Write tests
- [ ] Update frontend menu display

---

### Phase 5: Testing & Optimization (Week 6-7)

- [ ] End-to-end integration testing
- [ ] Load testing (JMeter or Gatling)
- [ ] Security audit (penetration testing)
- [ ] Performance tuning:
  - Database indexing
  - JPA query optimization (avoid N+1)
  - Kafka partition tuning
  - Gateway rate limiting
- [ ] Documentation updates
- [ ] Runbook creation for operations

---

### Phase 6: Deployment & Cutover (Week 7-8)

- [ ] Set up production Docker Swarm or Kubernetes cluster
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Data migration to production MySQL
- [ ] Blue-green deployment or canary release
- [ ] Monitor for 48 hours
- [ ] Decommission old Fastify backend

---

## 🚀 Setup Instructions

### Prerequisites
- Java 17+ (OpenJDK recommended)
- Docker & Docker Compose
- Gradle 8.x
- Git
- IDE (IntelliJ IDEA recommended)

### Quick Start

```bash
# 1. Clone the repository
cd /home/user/GARBAKING_POS/garbaking-backend

# 2. Build all microservices
./gradlew clean build

# 3. Start infrastructure with Docker Compose
docker-compose up -d mysql kafka zookeeper zipkin

# Wait for services to be healthy (~30 seconds)

# 4. Start Spring Boot services in order:
# Config Server first
cd config-server && ./gradlew bootRun &

# Wait 10 seconds, then Discovery Server
cd discovery-server && ./gradlew bootRun &

# Wait 20 seconds, then API Gateway
cd api-gateway && ./gradlew bootRun &

# Finally, business services
cd user-service && ./gradlew bootRun &
cd order-service && ./gradlew bootRun &
cd inventory-service && ./gradlew bootRun &

# 5. Verify services are up
curl http://localhost:8761  # Eureka dashboard
curl http://localhost:8888/actuator/health  # Config Server
curl http://localhost:8080/actuator/health  # API Gateway
curl http://localhost:8081/actuator/health  # User Service

# 6. Test authentication
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📦 Service Details

### 1. Config Server (Port 8888)
**Purpose:** Centralized configuration management

**Endpoints:**
- `GET /user-service/default` - User service config
- `GET /order-service/default` - Order service config

**Configuration Files:** `config-server/src/main/resources/config/`

### 2. Discovery Server (Port 8761)
**Purpose:** Service registry for dynamic service discovery

**Dashboard:** http://localhost:8761

### 3. API Gateway (Port 8080)
**Purpose:** Single entry point, routing, authentication

**Routes:**
- `/api/auth/**` → user-service
- `/api/users/**` → user-service
- `/api/orders/**` → order-service
- `/api/menu/**` → inventory-service
- `/api/inventory/**` → inventory-service

### 4. User Service (Port 8081)
**Purpose:** User management, authentication, JWT

**Key Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Authenticate and get JWT
- `POST /auth/refresh` - Refresh JWT token
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

**Database:** `garbaking_db.users` table

**Kafka Topics Published:**
- `user.created`
- `user.updated`
- `user.deleted`

### 5. Order Service (Port 8082)
**Purpose:** Order management, order processing

**Key Endpoints:**
- `POST /orders` - Create new order
- `GET /orders/{id}` - Get order by ID
- `PUT /orders/{id}/status` - Update order status
- `GET /orders/user/{userId}` - Get user's orders
- `DELETE /orders/{id}` - Cancel order

**Database:** `garbaking_db.orders`, `garbaking_db.order_items` tables

**Kafka Topics:**
- Published: `order.created`, `order.updated`, `order.cancelled`
- Consumed: `inventory.updated`, `payment.completed`

### 6. Inventory Service (Port 8083)
**Purpose:** Menu items, categories, stock management

**Key Endpoints:**
- `GET /menu/public` - Get public menu
- `GET /menu/categories` - Get all categories
- `GET /menu/items` - Get menu items
- `POST /menu/items` - Create menu item (admin)
- `PUT /menu/items/{id}` - Update menu item
- `PUT /inventory/{id}/stock` - Update stock

**Database:** `garbaking_db.menu_items`, `garbaking_db.categories`, `garbaking_db.inventory_items` tables

**Kafka Topics:**
- Published: `inventory.updated`, `menu.updated`
- Consumed: `order.created` (to decrement stock)

---

## 🗄️ Data Migration

### SQLite to MySQL Migration Strategy

#### 1. Export Data from SQLite (Fastify Backend)

```bash
# Export users
sqlite3 backend/dev.db ".mode csv" ".output users.csv" "SELECT * FROM users;"

# Export orders
sqlite3 backend/dev.db ".mode csv" ".output orders.csv" "SELECT * FROM orders;"

# Export order items
sqlite3 backend/dev.db ".mode csv" ".output order_items.csv" "SELECT * FROM order_items;"

# Export menu items
sqlite3 backend/dev.db ".mode csv" ".output menu_items.csv" "SELECT * FROM menu_items;"

# Export categories
sqlite3 backend/dev.db ".mode csv" ".output categories.csv" "SELECT * FROM categories;"
```

#### 2. Transform Data Format

Create a migration script (`scripts/migrate-data.sh`):

```bash
#!/bin/bash
# Transform Prisma UUID to MySQL BIGINT
# Transform timestamps to MySQL datetime format
# Hash passwords with BCrypt (if not already hashed)

python3 scripts/transform-data.py
```

#### 3. Import into MySQL

```sql
-- Load data into MySQL
LOAD DATA LOCAL INFILE '/path/to/users.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE '/path/to/orders.csv'
INTO TABLE orders
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

---

## 🧪 Testing Strategy

### Unit Tests
```java
@SpringBootTest
class UserServiceTest {

    @Autowired
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void testCreateUser() {
        // Test user creation logic
    }
}
```

### Integration Tests with Testcontainers
```java
@Testcontainers
@SpringBootTest
class UserIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");

    @Test
    void testUserRegistrationFlow() {
        // Test complete registration flow with real database
    }
}
```

---

## 🚢 Deployment

### Docker Build
```bash
# Build all services
./gradlew bootBuildImage

# Or use Docker Compose
docker-compose build
```

### Kubernetes Deployment (Optional)
```yaml
# user-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: garbaking/user-service:1.0.0
        ports:
        - containerPort: 8081
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "kubernetes"
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "406 Not Acceptable" Error
**Cause:** Content negotiation failure
**Solution:**
```java
@RestController
@RequestMapping(value = "/api/users", produces = MediaType.APPLICATION_JSON_VALUE)
public class UserController {
    // Explicitly set produces
}
```

#### 2. Infinite Recursion in JSON
**Cause:** Bidirectional JPA relationships
**Solution:**
```java
@Entity
public class Order {
    @OneToMany(mappedBy = "order")
    @JsonIgnore  // Don't serialize order items here
    private List<OrderItem> items;
}

// Use DTOs instead:
public class OrderDTO {
    private Long id;
    private List<OrderItemDTO> items;  // Flat DTO, no recursion
}
```

#### 3. Eureka Service Not Registering
**Cause:** Missing `@EnableDiscoveryClient` or incorrect configuration
**Solution:**
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://discovery-server:8761/eureka/
  instance:
    prefer-ip-address: true
    lease-renewal-interval-in-seconds: 30
```

#### 4. JWT Token Invalid
**Cause:** Secret key mismatch between Gateway and User Service
**Solution:** Use Config Server for shared JWT secret

---

## 📚 Additional Resources

- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **Spring Cloud Docs:** https://spring.io/projects/spring-cloud
- **Spring Data JPA:** https://spring.io/projects/spring-data-jpa
- **Kafka with Spring:** https://spring.io/projects/spring-kafka
- **Docker Compose:** https://docs.docker.com/compose/
- **Testcontainers:** https://www.testcontainers.org/

---

## ✅ Next Steps

1. **Review this guide** with your team
2. **Set up development environment** (Java, Docker, IDE)
3. **Start with Phase 1** (Infrastructure setup)
4. **Build User Service first** as a proof of concept
5. **Test end-to-end** before proceeding to other services
6. **Document any deviations** from this plan

---

## 📞 Support

For questions or issues during migration:
- Check GitHub Issues
- Review Spring Boot documentation
- Consult with Spring Boot experts

**Good luck with your migration! 🚀**
