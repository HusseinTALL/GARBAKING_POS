# Garbaking POS - Startup Scripts Guide

This document explains how to use the startup/shutdown scripts for the **Spring Boot microservices backend** architecture.

## Overview

The project has been migrated from the old Node.js backend (`/backend`) to a new Spring Boot microservices architecture (`/garbaking-backend`). All startup scripts have been updated accordingly.

## Architecture

### Backend Services (Spring Boot)
- **Config Server** (Port 8762) - Configuration management
- **Discovery Server** (Port 8761) - Eureka service discovery
- **API Gateway** (Port 8080) - Single entry point for all APIs
- **User Service** (Port 8081) - User management and authentication
- **Order Service** (Port 8082) - Order processing
- **Inventory Service** (Port 8083) - Menu items and categories

### Frontend Applications (Vue 3)
- **Admin POS** (Port 3000) - Point of sale admin interface
- **Customer App** (Port 3002) - Customer ordering interface
- **Kitchen Display** (Port 3003) - Kitchen order display

### Infrastructure (Docker)
- **MySQL** (Port 3306) - Database
- **Zookeeper** (Port 2181) - Kafka coordination
- **Kafka** (Port 9092) - Message broker

## Scripts

### 1. `./start-all.sh`
Starts all services in the correct order.

**Usage:**
```bash
./start-all.sh
```

**What it does:**
1. Checks and kills any processes on required ports
2. Starts Docker infrastructure (MySQL, Kafka, Zookeeper) if not running
3. Builds all Spring Boot services using Gradle
4. Starts backend services in order:
   - Config Server → Discovery Server → Microservices → API Gateway
5. Waits for services to register with Eureka
6. Starts all frontend applications

**Logs:** All logs are saved to `./logs/` directory

**Time:** Takes approximately 2-3 minutes for full startup

### 2. `./stop-all.sh`
Stops all running services.

**Usage:**
```bash
./stop-all.sh
```

**What it does:**
1. Stops all frontend applications
2. Stops all backend microservices
3. Reports on Docker infrastructure status
4. Verifies all ports are freed
5. Shows port status check

**Note:** Docker services (MySQL, Kafka) are NOT stopped by default. To stop them:
```bash
cd garbaking-backend && docker-compose down
```

### 3. `./status.sh`
Shows comprehensive status of all services.

**Usage:**
```bash
./status.sh
```

**What it shows:**
1. Docker infrastructure status (MySQL, Kafka, Zookeeper)
2. Backend microservices status with health checks
3. Frontend applications status
4. All service URLs
5. Quick API endpoint tests (if Gateway is running)
6. Summary of running vs stopped services

**Example output:**
```
✓ User Service - Running (Port: 8081, PID: 12345) [Healthy]
✗ Order Service - Not Running (Port: 8082)
```

## Common Workflows

### Starting Everything
```bash
./start-all.sh
```
Wait for the "ALL SERVICES RUNNING" message, then access:
- Admin POS: http://localhost:3000
- API Gateway: http://localhost:8080

### Checking Status
```bash
./status.sh
```

### Stopping Everything
```bash
./stop-all.sh
```

### Restarting After Code Changes
```bash
./stop-all.sh
# Make your code changes
./start-all.sh
```

### Starting Only Backend
```bash
cd garbaking-backend
docker-compose up -d mysql zookeeper kafka
./gradlew build -x test
# Then start each service manually in order
```

### Starting Only Frontend
```bash
# In terminal 1:
cd frontend/admin-pos && npm run dev

# In terminal 2:
cd frontend/customer-app && npm run dev

# In terminal 3:
cd frontend/kds-app && npm run dev
```

## Service Startup Order

**Critical:** Services must start in this order for proper registration:

1. **Infrastructure** (MySQL, Kafka) - Must be ready first
2. **Config Server** (8762) - Optional, currently disabled
3. **Discovery Server** (8761) - Eureka must be up before others
4. **Microservices** (8081, 8082, 8083) - Can start in parallel
5. **API Gateway** (8080) - Must start after services register
6. **Frontend Apps** (3000, 3002, 3003) - Can start in parallel

## Troubleshooting

### Services won't start
```bash
# Check if ports are in use
./status.sh

# Force kill all processes
./stop-all.sh

# Check logs
tail -f logs/api-gateway.log
tail -f logs/user-service.log
```

### API Gateway returns 500 errors
**Fixed Issues:**
1. ✅ Spring Security `@PreAuthorize` annotations - Disabled method-level security
2. ✅ CORS configuration conflict - Removed duplicate CORS config from application.yml

**If still happening:**
```bash
# Check Gateway logs
tail -f logs/api-gateway.log

# Test direct service access
curl http://localhost:8083/categories
curl http://localhost:8082/orders
```

### Database issues
```bash
# Check MySQL is running
docker ps | grep mysql

# Restart MySQL
cd garbaking-backend
docker-compose restart mysql

# Check database data
docker exec -it garbaking-mysql mysql -uroot -prootpassword garbaking_db
```

### Frontend can't connect to backend
**Verify:**
1. API Gateway is running on port 8080
2. Health check works: `curl http://localhost:8080/actuator/health`
3. Frontend is using correct API URL (should be `http://localhost:8080`)
4. Check browser console for CORS errors

**Frontend environment variable:**
```bash
# In frontend/admin-pos/.env
VITE_API_GATEWAY_URL=http://localhost:8080
```

## Log Files

All logs are in `./logs/`:
- `api-gateway.log` - API Gateway logs
- `config-server.log` - Config Server logs
- `discovery-server.log` - Eureka logs
- `user-service.log` - User Service logs
- `order-service.log` - Order Service logs
- `inventory-service.log` - Inventory Service logs
- `admin-pos.log` - Admin frontend logs
- `customer-app.log` - Customer frontend logs
- `kds-app.log` - Kitchen Display logs

## Quick Reference

| Command | Purpose |
|---------|---------|
| `./start-all.sh` | Start all services |
| `./stop-all.sh` | Stop all services |
| `./status.sh` | Check service status |
| `docker-compose up -d` | Start infrastructure only |
| `docker-compose down` | Stop Docker services |
| `./gradlew build` | Build all services |
| `curl localhost:8080/actuator/health` | Check Gateway health |

## Service Endpoints

### API Gateway (Port 8080)
- Health: `http://localhost:8080/actuator/health`
- Categories: `http://localhost:8080/api/categories`
- Menu Items: `http://localhost:8080/api/menu-items`
- Orders: `http://localhost:8080/api/orders`
- Users: `http://localhost:8080/api/users`
- Auth: `http://localhost:8080/api/auth/login`

### Direct Service Access
- User Service: `http://localhost:8081/`
- Order Service: `http://localhost:8082/`
- Inventory Service: `http://localhost:8083/`

### Management
- Eureka Dashboard: `http://localhost:8761/`
- Config Server: `http://localhost:8762/`

## Important Notes

1. **Old Backend:** The old Node.js backend in `/backend` is NO LONGER USED
2. **Port 3001:** No longer used (was old backend API)
3. **Database:** Now using MySQL in Docker instead of SQLite
4. **Security:** Method-level security has been disabled for development
5. **CORS:** Configured to allow localhost:3000, 3002, 3003

## Migration Notes

**Changes from old architecture:**
- Port 3001 (old Node.js API) → Port 8080 (Spring Boot API Gateway)
- SQLite → MySQL in Docker
- Single backend → 6 microservices
- Direct API calls → API Gateway routing
- No service discovery → Eureka service discovery

**Frontend changes:**
- Update all API calls to use port 8080
- Use `VITE_API_GATEWAY_URL` environment variable
- Health checks now at `/actuator/health`
