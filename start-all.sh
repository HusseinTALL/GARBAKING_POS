#!/bin/bash

###############################################################################
# Garbaking POS - Full Stack Startup Script (Spring Boot Backend)
# Starts Spring Boot microservices backend and all frontend applications
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/garbaking-backend"
ADMIN_DIR="$SCRIPT_DIR/frontend/admin-pos"
CUSTOMER_DIR="$SCRIPT_DIR/frontend/customer-app"
KDS_DIR="$SCRIPT_DIR/frontend/kds-app"
LOGS_DIR="$SCRIPT_DIR/logs"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     🥐  GARBAKING POS - SPRING BOOT FULL STACK  🥐         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Array to store PIDs
declare -a PIDS=()

# Cleanup function
cleanup() {
    echo
    print_warning "Shutting down all services..."

    # Kill Java processes
    for pid in "${PIDS[@]}"; do
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null || true
        fi
    done

    # Kill any remaining processes on our ports
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true  # API Gateway
    lsof -ti:8761 | xargs kill -9 2>/dev/null || true  # Eureka
    lsof -ti:8762 | xargs kill -9 2>/dev/null || true  # Config Server
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true  # User Service
    lsof -ti:8082 | xargs kill -9 2>/dev/null || true  # Order Service
    lsof -ti:8083 | xargs kill -9 2>/dev/null || true  # Inventory Service
    lsof -ti:8085 | xargs kill -9 2>/dev/null || true  # Operations Service
    lsof -ti:8086 | xargs kill -9 2>/dev/null || true  # Analytics Service
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true  # Admin POS
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true  # Customer App
    lsof -ti:3003 | xargs kill -9 2>/dev/null || true  # KDS App

    print_status "All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Create logs directory
mkdir -p "$LOGS_DIR"

# Check and kill existing processes
print_info "Checking for existing processes..."
for port in 8080 8761 8762 8081 8082 8083 8085 8086 3000 3002 3003; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Port $port is in use. Killing existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
done
print_status "All ports are available"

# Check if Docker services (MySQL, Kafka) are running
echo
print_info "Checking Docker infrastructure services..."
cd "$BACKEND_DIR"

if ! docker ps | grep -q "garbaking-mysql"; then
    print_warning "MySQL is not running. Starting Docker infrastructure..."
    docker-compose up -d mysql zookeeper kafka
    print_info "Waiting for MySQL to be ready..."
    sleep 15
    print_status "MySQL started"
else
    print_status "MySQL is already running"
fi

if ! docker ps | grep -q "garbaking-kafka"; then
    print_warning "Kafka is not running. Starting..."
    docker-compose up -d zookeeper kafka
    sleep 10
    print_status "Kafka started"
else
    print_status "Kafka is already running"
fi

# Build Spring Boot services if needed
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Building Spring Boot Services..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

./gradlew build -x test
print_status "All services built successfully"

# Start Config Server
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Config Server (Port 8762)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR/config-server"
java -jar build/libs/config-server-1.0.0.jar --spring.cloud.config.enabled=false > "$LOGS_DIR/config-server.log" 2>&1 &
CONFIG_PID=$!
PIDS+=($CONFIG_PID)
sleep 10

if kill -0 $CONFIG_PID 2>/dev/null; then
    print_status "Config Server started (PID: $CONFIG_PID)"
else
    print_error "Failed to start Config Server"
    tail -20 "$LOGS_DIR/config-server.log"
    exit 1
fi

# Start Discovery Server (Eureka)
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Discovery Server (Port 8761)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR/discovery-server"
java -jar build/libs/discovery-server-1.0.0.jar --spring.cloud.config.enabled=false > "$LOGS_DIR/discovery-server.log" 2>&1 &
DISCOVERY_PID=$!
PIDS+=($DISCOVERY_PID)
sleep 15

if kill -0 $DISCOVERY_PID 2>/dev/null; then
    print_status "Discovery Server started (PID: $DISCOVERY_PID)"
else
    print_error "Failed to start Discovery Server"
    tail -20 "$LOGS_DIR/discovery-server.log"
    exit 1
fi

# Start User Service
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting User Service (Port 8081)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR/user-service"
java -jar build/libs/user-service-1.0.0.jar --spring.cloud.config.enabled=false > "$LOGS_DIR/user-service.log" 2>&1 &
USER_PID=$!
PIDS+=($USER_PID)
sleep 10

if kill -0 $USER_PID 2>/dev/null; then
    print_status "User Service started (PID: $USER_PID)"
else
    print_warning "User Service may have failed to start"
fi

# Start Order Service
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Order Service (Port 8082)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR/order-service"
java -jar build/libs/order-service-1.0.0.jar --spring.cloud.config.enabled=false > "$LOGS_DIR/order-service.log" 2>&1 &
ORDER_PID=$!
PIDS+=($ORDER_PID)
sleep 10

if kill -0 $ORDER_PID 2>/dev/null; then
    print_status "Order Service started (PID: $ORDER_PID)"
else
    print_warning "Order Service may have failed to start"
fi

# Start Inventory Service
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Inventory Service (Port 8083)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR/inventory-service"
java -jar build/libs/inventory-service-1.0.0.jar --spring.cloud.config.enabled=false > "$LOGS_DIR/inventory-service.log" 2>&1 &
INVENTORY_PID=$!
PIDS+=($INVENTORY_PID)
sleep 10

if kill -0 $INVENTORY_PID 2>/dev/null; then
    print_status "Inventory Service started (PID: $INVENTORY_PID)"
else
    print_warning "Inventory Service may have failed to start"
fi

# Start Operations Service
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Operations Service (Port 8085)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR/operations-service"
java -jar build/libs/operations-service-1.0.0.jar --spring.cloud.config.enabled=false > "$LOGS_DIR/operations-service.log" 2>&1 &
OPERATIONS_PID=$!
PIDS+=($OPERATIONS_PID)
sleep 10

if kill -0 $OPERATIONS_PID 2>/dev/null; then
    print_status "Operations Service started (PID: $OPERATIONS_PID)"
else
    print_warning "Operations Service may have failed to start"
fi

# Start Analytics Service
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Analytics Service (Port 8086)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR/analytics-service"
java -jar build/libs/analytics-service-1.0.0.jar --spring.cloud.config.enabled=false > "$LOGS_DIR/analytics-service.log" 2>&1 &
ANALYTICS_PID=$!
PIDS+=($ANALYTICS_PID)
sleep 10

if kill -0 $ANALYTICS_PID 2>/dev/null; then
    print_status "Analytics Service started (PID: $ANALYTICS_PID)"
else
    print_warning "Analytics Service may have failed to start"
fi

# Start API Gateway
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting API Gateway (Port 8080)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR/api-gateway"
java -jar build/libs/api-gateway-1.0.0.jar --spring.cloud.config.enabled=false > "$LOGS_DIR/api-gateway.log" 2>&1 &
GATEWAY_PID=$!
PIDS+=($GATEWAY_PID)
sleep 15

if kill -0 $GATEWAY_PID 2>/dev/null; then
    print_status "API Gateway started (PID: $GATEWAY_PID)"
else
    print_error "Failed to start API Gateway"
    tail -20 "$LOGS_DIR/api-gateway.log"
    exit 1
fi

# Wait for services to register with Eureka
print_info "Waiting for services to register with Eureka..."
sleep 10
print_status "All backend services should now be registered"

# Start Admin POS
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Admin POS (Port 3000)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$ADMIN_DIR"
npm run dev > "$LOGS_DIR/admin-pos.log" 2>&1 &
ADMIN_PID=$!
PIDS+=($ADMIN_PID)
sleep 3

if kill -0 $ADMIN_PID 2>/dev/null; then
    print_status "Admin POS started (PID: $ADMIN_PID)"
else
    print_warning "Failed to start Admin POS"
fi

# Start Customer App
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Customer App (Port 3002)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$CUSTOMER_DIR"
npm run dev > "$LOGS_DIR/customer-app.log" 2>&1 &
CUSTOMER_PID=$!
PIDS+=($CUSTOMER_PID)
sleep 3

if kill -0 $CUSTOMER_PID 2>/dev/null; then
    print_status "Customer App started (PID: $CUSTOMER_PID)"
else
    print_warning "Failed to start Customer App"
fi

# Start KDS App
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Kitchen Display System (Port 3003)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$KDS_DIR"
npm run dev > "$LOGS_DIR/kds-app.log" 2>&1 &
KDS_PID=$!
PIDS+=($KDS_PID)
sleep 3

if kill -0 $KDS_PID 2>/dev/null; then
    print_status "KDS App started (PID: $KDS_PID)"
else
    print_warning "Failed to start KDS App"
fi

# Summary
echo
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉  ALL SERVICES RUNNING  🎉                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "${CYAN}🔧 Backend Services:${NC}"
echo -e "   Config Server:      http://localhost:8762"
echo -e "   Discovery (Eureka): http://localhost:8761"
echo -e "   API Gateway:        http://localhost:8080"
echo -e "   User Service:       http://localhost:8081"
echo -e "   Order Service:      http://localhost:8082"
echo -e "   Inventory Service:  http://localhost:8083"
echo -e "   Operations Service: http://localhost:8085"
echo -e "   Analytics Service:  http://localhost:8086"
echo
echo -e "${CYAN}📱 Frontend Apps:${NC}"
echo -e "   🖥️  Admin POS:         http://localhost:3000"
echo -e "   👥 Customer App:      http://localhost:3002"
echo -e "   🍳 Kitchen Display:   http://localhost:3003"
echo
echo -e "${CYAN}🗄️  Infrastructure:${NC}"
echo -e "   MySQL:              localhost:3306"
echo -e "   Kafka:              localhost:9092"
echo
echo -e "${YELLOW}📋 Logs are saved in:${NC} $LOGS_DIR/"
echo -e "${YELLOW}📊 Check status:${NC}      ./status.sh"
echo -e "${YELLOW}⌨️  Press Ctrl+C to stop all services${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Wait for all processes
wait
