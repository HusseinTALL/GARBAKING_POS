#!/bin/bash

###############################################################################
# Garbaking POS - Stop All Services Script (Spring Boot Backend)
# Stops all Spring Boot microservices and frontend applications
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🛑 Stopping Garbaking POS System            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to kill processes by port
kill_by_port() {
    local port=$1
    local service_name=$2

    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        print_warning "Stopping $service_name on port $port..."
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 1
        print_status "$service_name stopped"
    else
        print_info "$service_name (port $port) is not running"
    fi
}

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Stopping Frontend Applications..."
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

kill_by_port 3000 "Admin POS"
kill_by_port 3002 "Customer App"
kill_by_port 3003 "Kitchen Display System"

# Kill any lingering Vite processes
pkill -f "vite.*admin-pos" 2>/dev/null || true
pkill -f "vite.*customer-app" 2>/dev/null || true
pkill -f "vite.*kds-app" 2>/dev/null || true

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Stopping Backend Microservices..."
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

kill_by_port 8080 "API Gateway"
kill_by_port 8081 "User Service"
kill_by_port 8082 "Order Service"
kill_by_port 8083 "Inventory Service"
kill_by_port 8761 "Discovery Server (Eureka)"
kill_by_port 8762 "Config Server"

# Kill any lingering Java processes
print_warning "Cleaning up Java processes..."
pkill -f "api-gateway-1.0.0.jar" 2>/dev/null || true
pkill -f "user-service-1.0.0.jar" 2>/dev/null || true
pkill -f "order-service-1.0.0.jar" 2>/dev/null || true
pkill -f "inventory-service-1.0.0.jar" 2>/dev/null || true
pkill -f "discovery-server-1.0.0.jar" 2>/dev/null || true
pkill -f "config-server-1.0.0.jar" 2>/dev/null || true

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Checking Docker Infrastructure..."
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if docker ps | grep -q "garbaking"; then
    print_warning "Docker services are still running"
    echo "   MySQL and Kafka are running in Docker"
    echo "   To stop them, run: cd garbaking-backend && docker-compose down"
else
    print_info "No Docker services running"
fi

sleep 2

# Verify all services are stopped
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 Port Status Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

check_port() {
    lsof -ti:$1 >/dev/null 2>&1
    return $?
}

# Backend ports
echo "Backend Services:"
for port in 8080 8081 8082 8083 8761 8762; do
    if check_port $port; then
        echo -e "   ⚠️  Port $port: ${YELLOW}Still in use${NC}"
    else
        echo -e "   ✅ Port $port: ${GREEN}Free${NC}"
    fi
done

# Frontend ports
echo ""
echo "Frontend Applications:"
for port in 3000 3002 3003; do
    if check_port $port; then
        echo -e "   ⚠️  Port $port: ${YELLOW}Still in use${NC}"
    else
        echo -e "   ✅ Port $port: ${GREEN}Free${NC}"
    fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All services stopped!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🚀 To start all services again, run: ${YELLOW}./start-all.sh${NC}"
echo -e "📊 To check service status, run: ${YELLOW}./status.sh${NC}"
echo ""
