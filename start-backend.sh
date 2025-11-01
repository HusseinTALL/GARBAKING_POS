#!/bin/bash

###############################################################################
# Garbaking POS - Spring Boot Backend Startup Script
# Starts the microservice backend stack without the frontend apps
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/garbaking-backend"
LOGS_DIR="$SCRIPT_DIR/logs"

# Ports used by backend services
BACKEND_PORTS=(8762 8761 8081 8082 8083 8085 8086 8080)

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     🥐  GARBAKING POS - SPRING BOOT BACKEND STARTUP 🥐     ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_info()   { echo -e "${BLUE}ℹ${NC} $1"; }
print_warn()   { echo -e "${YELLOW}⚠${NC} $1"; }
print_error()  { echo -e "${RED}✗${NC} $1"; }

if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Spring Boot backend directory not found at $BACKEND_DIR"
    exit 1
fi

mkdir -p "$LOGS_DIR"

declare -a PIDS=()

cleanup() {
    echo
    print_warn "Stopping backend services..."
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done
    for port in "${BACKEND_PORTS[@]}"; do
        lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
    done
    print_status "Backend services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

print_info "Checking for existing processes..."
for port in "${BACKEND_PORTS[@]}"; do
    if lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warn "Port $port in use. Terminating process..."
        lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
done
print_status "All backend ports are free"

print_info "Ensuring Docker infrastructure (MySQL, Kafka) is running..."
cd "$BACKEND_DIR"
if ! docker ps | grep -q "garbaking-mysql"; then
    print_warn "MySQL container not running. Starting docker-compose services..."
    docker-compose up -d mysql zookeeper kafka
    print_info "Waiting for MySQL to initialize..."
    sleep 15
else
    print_status "MySQL container is already running"
fi

if ! docker ps | grep -q "garbaking-kafka"; then
    print_warn "Kafka container not running. Starting..."
    docker-compose up -d zookeeper kafka
    print_info "Waiting for Kafka to be ready..."
    sleep 10
else
    print_status "Kafka container is already running"
fi

echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Building backend microservices (gradlew build -x test)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
./gradlew build -x test
print_status "Spring Boot services compiled successfully"

start_service() {
    local name=$1
    local module_dir=$2
    local jar_name=$3
    local port=$4
    local extra_args=$5

    echo
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    print_info "Starting $name (port $port)..."
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    cd "$BACKEND_DIR/$module_dir"
    if [ ! -f "build/libs/$jar_name" ]; then
        print_error "Jar build/libs/$jar_name not found for $name"
        cleanup
    fi
    java -jar "build/libs/$jar_name" $extra_args > "$LOGS_DIR/$module_dir.log" 2>&1 &
    local pid=$!
    PIDS+=("$pid")
    sleep 8

    if kill -0 "$pid" 2>/dev/null; then
        print_status "$name started (PID: $pid)"
    else
        print_error "$name failed to start. See $LOGS_DIR/$module_dir.log"
        tail -20 "$LOGS_DIR/$module_dir.log"
        cleanup
    fi
}

start_service "Config Server" "config-server" "config-server-1.0.0.jar" 8762 "--spring.cloud.config.enabled=false"
start_service "Discovery Server (Eureka)" "discovery-server" "discovery-server-1.0.0.jar" 8761 "--spring.cloud.config.enabled=false"
start_service "User Service" "user-service" "user-service-1.0.0.jar" 8081 "--spring.cloud.config.enabled=false"
start_service "Order Service" "order-service" "order-service-1.0.0.jar" 8082 "--spring.cloud.config.enabled=false"
start_service "Inventory Service" "inventory-service" "inventory-service-1.0.0.jar" 8083 "--spring.cloud.config.enabled=false"
start_service "Operations Service" "operations-service" "operations-service-1.0.0.jar" 8085 "--spring.cloud.config.enabled=false"
start_service "Analytics Service" "analytics-service" "analytics-service-1.0.0.jar" 8086 "--spring.cloud.config.enabled=false"

print_info "Waiting for services to register with Eureka..."
sleep 10

start_service "API Gateway" "api-gateway" "api-gateway-1.0.0.jar" 8080 "--spring.cloud.config.enabled=false"

echo
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       🎉  SPRING BOOT BACKEND IS RUNNING! 🎉     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo
echo -e "${CYAN}Service URLs:${NC}"
echo "  Config Server:      http://localhost:8762"
echo "  Discovery (Eureka): http://localhost:8761"
echo "  API Gateway:        http://localhost:8080"
echo "  User Service:       http://localhost:8081"
echo "  Order Service:      http://localhost:8082"
echo "  Inventory Service:  http://localhost:8083"
echo "  Operations Service: http://localhost:8085"
echo "  Analytics Service:  http://localhost:8086"
echo
echo -e "${CYAN}Logs directory:${NC} $LOGS_DIR"
echo -e "${CYAN}Stop script:${NC} Ctrl+C"
echo
wait
cleanup
