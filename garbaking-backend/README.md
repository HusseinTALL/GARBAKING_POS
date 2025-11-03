# Garbaking POS - Spring Boot Backend

Modern microservices architecture for the Garbaking Point of Sale system.

## 🏗️ Architecture

```
Frontend (Vue.js)
    ↓
API Gateway (Port 8080) - JWT Authentication
    ├── Discovery Client (Eureka)
    └── Routes to Services
        ↓
    ┌───────────┬──────────────┬────────────────┐
    ↓           ↓              ↓                ↓
User Service  Order Service  Inventory Service  ...
:8081         :8082          :8083
    ↓           ↓              ↓
  MySQL       MySQL          MySQL
```

## 📦 Services

### Infrastructure Services

1. **Config Server** (Port 8888)
   - Centralized configuration management
   - Stores configuration for all microservices

2. **Discovery Server** (Port 8761)
   - Service registry using Netflix Eureka
   - Enables dynamic service discovery

3. **API Gateway** (Port 8080)
   - Single entry point for all client requests
   - JWT authentication and authorization
   - Routes requests to appropriate microservices

### Business Services

4. **User Service** (Port 8081) ✅ COMPLETED
   - User registration and authentication
   - JWT token generation
   - User profile management
   - Password encryption with BCrypt
   - Publishes user events to Kafka

5. **Order Service** (Port 8082) 🚧 TODO
   - Order creation and management
   - Order status updates
   - Order history
   - Integrates with Inventory Service

6. **Inventory Service** (Port 8083) 🚧 TODO
   - Menu item management
   - Category management
   - Stock tracking
   - Image upload

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Docker & Docker Compose
- Gradle 8.x
- MySQL 8.0 (via Docker)

### 1. Start Infrastructure with Docker Compose

```bash
cd /home/user/GARBAKING_POS/garbaking-backend

# Start MySQL, Kafka, Zookeeper, and Zipkin
docker-compose up -d mysql kafka zookeeper zipkin

# Wait for services to be healthy (~30 seconds)
docker-compose ps

# Check MySQL is ready
docker exec -it garbaking-mysql mysql -uroot -prootpassword -e "SELECT 1"
```

### 2. Build All Services

```bash
# Build all microservices
./gradlew clean build

# Or build individual services
./gradlew :user-service:build
./gradlew :api-gateway:build
```

### 3. Start Services in Order

**IMPORTANT:** Services must be started in this specific order due to dependencies.

```bash
# 1. Config Server (Port 8888) - Start first
cd config-server
./gradlew bootRun &
echo "⏳ Waiting 10 seconds for Config Server..."
sleep 10

# 2. Discovery Server (Port 8761) - Start second
cd ../discovery-server
./gradlew bootRun &
echo "⏳ Waiting 20 seconds for Discovery Server..."
sleep 20

# 3. API Gateway (Port 8080) - Start third
cd ../api-gateway
./gradlew bootRun &
echo "⏳ Waiting 15 seconds for API Gateway..."
sleep 15

# 4. Business Services - Start last
cd ../user-service
./gradlew bootRun &
echo "⏳ Waiting 10 seconds for User Service..."
sleep 10

cd ..
echo "✅ All services started!"
```

### 4. Verify Services

```bash
# Check Eureka Dashboard
open http://localhost:8761

# Check Config Server
curl http://localhost:8888/actuator/health

# Check API Gateway
curl http://localhost:8080/actuator/health

# Check User Service
curl http://localhost:8081/actuator/health
```

## 🧪 Test the API

### 1. Register a new user

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "CUSTOMER"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "CUSTOMER",
    "active": true,
    "createdAt": "2025-01-15T10:30:00"
  },
  "message": "User registered successfully"
}
```

### 2. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Get user profile (requires JWT token)

```bash
# Save the token from login/register response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Get current user profile

```bash
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Update user profile

```bash
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phone": "+9876543210"
  }'
```

## 📊 Monitoring

### Eureka Dashboard
View all registered services and their health status.
```bash
open http://localhost:8761
```

### Zipkin Tracing
View distributed tracing for debugging.
```bash
open http://localhost:9411
```

### Actuator Endpoints
Each service exposes health and metrics endpoints.

```bash
# User Service
curl http://localhost:8081/actuator/health
curl http://localhost:8081/actuator/metrics

# API Gateway
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/routes
```

## 🗄️ Database

### Access MySQL

```bash
# Via Docker
docker exec -it garbaking-mysql mysql -uroot -prootpassword

# Use the database
USE garbaking_db;

# View users table
SELECT * FROM users;

# View all tables
SHOW TABLES;
```

### Database Schema

The database schema is automatically created by Hibernate (JPA) on first run.

**Users Table:**
```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

## 📡 Kafka Events

### Topics Published by User Service

- `user.created` - Published when a new user registers
- `user.updated` - Published when a user profile is updated
- `user.deleted` - Published when a user is deleted (deactivated)

### View Kafka Topics

```bash
# List all topics
docker exec -it garbaking-kafka kafka-topics --list --bootstrap-server localhost:9092

# Consume user events
docker exec -it garbaking-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user.created \
  --from-beginning
```

## 🔧 Configuration

### JWT Secret

⚠️ **IMPORTANT:** Change the JWT secret in production!

The default secret is stored in:
- `config-server/src/main/resources/config/application.yml`
- `api-gateway/src/main/resources/application.yml`
- `user-service/src/main/resources/application.yml`

```yaml
jwt:
  secret: your-256-bit-secret-key-for-jwt-signing-change-this-in-production
  expiration: 86400000  # 24 hours
```

### Database Configuration

Database credentials are in `docker-compose.yml` and each service's `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/garbaking_db
    username: root
    password: rootpassword
```

## 🧹 Stop All Services

```bash
# Stop Docker services
docker-compose down

# Kill Gradle processes
pkill -f gradle
pkill -f java

# Or use kill with specific PIDs
kill <PID>
```

## 🐛 Troubleshooting

### Services not registering with Eureka

**Problem:** Services start but don't appear in Eureka dashboard.

**Solution:**
1. Check Discovery Server is running: `curl http://localhost:8761`
2. Verify eureka configuration in `application.yml`
3. Wait 30 seconds for registration to complete

### Database connection errors

**Problem:** `Communications link failure` or `Connection refused`

**Solution:**
1. Check MySQL is running: `docker ps | grep mysql`
2. Verify MySQL is healthy: `docker-compose ps`
3. Check credentials match in `application.yml`

### JWT token invalid

**Problem:** 401 Unauthorized with valid token

**Solution:**
1. Verify same JWT secret in API Gateway and User Service
2. Check token hasn't expired (24 hour default)
3. Ensure token format: `Authorization: Bearer <token>`

### Port already in use

**Problem:** `Address already in use` error

**Solution:**
```bash
# Find process using port
lsof -ti:8081

# Kill the process
kill -9 $(lsof -ti:8081)
```

## 📚 API Documentation

### User Service Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/users/{id}` | Get user by ID | Yes |
| GET | `/api/users/me` | Get current user | Yes |
| GET | `/api/users` | Get all users | Admin only |
| PUT | `/api/users/{id}` | Update user | Yes (own profile or admin) |
| DELETE | `/api/users/{id}` | Delete user (soft) | Admin only |

### User Roles

- `ADMIN` - Full system access
- `STAFF` - Staff member access
- `CUSTOMER` - Customer access

## 🔐 Security

- Passwords are hashed with BCrypt (strength 10)
- JWT tokens expire after 24 hours
- API Gateway validates JWT for protected routes
- Method-level security with `@PreAuthorize` annotations
- CSRF protection disabled (stateless JWT auth)

## 🚧 Next Steps

### Phase 1: Complete Order Service
- [ ] Design Order and OrderItem entities
- [ ] Implement repositories and services
- [ ] Create REST controllers
- [ ] Add Kafka integration
- [ ] Write tests

### Phase 2: Complete Inventory Service
- [ ] Design MenuItem, Category entities
- [ ] Implement repositories and services
- [ ] Create REST controllers
- [ ] Add image upload support
- [ ] Write tests

### Phase 3: Frontend Integration
- [ ] Update Vue.js frontend to call API Gateway
- [ ] Update authentication flow
- [ ] Update order management
- [ ] Update menu display

### Phase 4: Production Readiness
- [ ] Add rate limiting to API Gateway
- [ ] Configure Redis for caching
- [ ] Set up Kubernetes deployment
- [ ] Add monitoring with Prometheus/Grafana
- [ ] Security audit

## 📖 Additional Documentation

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Complete migration guide from Fastify to Spring Boot
- [API Gateway Configuration](./api-gateway/README.md)
- [User Service Details](./user-service/README.md)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "feat: add my feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Open Pull Request

## 📄 License

Copyright © 2025 Garbaking POS
