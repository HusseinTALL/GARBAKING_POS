#!/bin/bash

###############################################################################
# Garbaking POS - Service Status Checker (Spring Boot Backend)
# Checks the status of all microservices and frontend applications
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     📊  GARBAKING POS - SERVICE STATUS CHECK  📊           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 >/dev/null 2>&1
    return $?
}

# Function to check HTTP endpoint
check_http() {
    curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$1" 2>/dev/null
}

# Function to print service status
print_service_status() {
    local service_name=$1
    local port=$2
    local health_url=$3

    if check_port $port; then
        local pid=$(lsof -ti:$port 2>/dev/null | head -1)

        if [ ! -z "$health_url" ]; then
            local http_code=$(check_http "$health_url")
            if [ "$http_code" == "200" ]; then
                echo -e "   ${GREEN}✓${NC} $service_name - ${GREEN}Running${NC} (Port: $port, PID: $pid) ${GREEN}[Healthy]${NC}"
            elif [ "$http_code" == "000" ]; then
                echo -e "   ${YELLOW}⚠${NC} $service_name - ${YELLOW}Starting${NC} (Port: $port, PID: $pid) ${YELLOW}[No Response]${NC}"
            else
                echo -e "   ${YELLOW}⚠${NC} $service_name - ${YELLOW}Running${NC} (Port: $port, PID: $pid) ${YELLOW}[HTTP $http_code]${NC}"
            fi
        else
            echo -e "   ${GREEN}✓${NC} $service_name - ${GREEN}Running${NC} (Port: $port, PID: $pid)"
        fi
    else
        echo -e "   ${RED}✗${NC} $service_name - ${RED}Not Running${NC} (Port: $port)"
    fi
}

# Check Docker Infrastructure
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🐳 Docker Infrastructure:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if docker ps | grep -q "garbaking-mysql"; then
    echo -e "   ${GREEN}✓${NC} MySQL - ${GREEN}Running${NC} (Port: 3306)"
else
    echo -e "   ${RED}✗${NC} MySQL - ${RED}Not Running${NC} (Port: 3306)"
fi

if docker ps | grep -q "garbaking-zookeeper"; then
    echo -e "   ${GREEN}✓${NC} Zookeeper - ${GREEN}Running${NC} (Port: 2181)"
else
    echo -e "   ${RED}✗${NC} Zookeeper - ${RED}Not Running${NC} (Port: 2181)"
fi

if docker ps | grep -q "garbaking-kafka"; then
    echo -e "   ${GREEN}✓${NC} Kafka - ${GREEN}Running${NC} (Port: 9092)"
else
    echo -e "   ${RED}✗${NC} Kafka - ${RED}Not Running${NC} (Port: 9092)"
fi

# Check Backend Services
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔧 Backend Microservices:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_service_status "Config Server" 8762 "http://localhost:8762/actuator/health"
print_service_status "Discovery Server" 8761 "http://localhost:8761/actuator/health"
print_service_status "API Gateway" 8080 "http://localhost:8080/actuator/health"
print_service_status "User Service" 8081 "http://localhost:8081/actuator/health"
print_service_status "Order Service" 8082 "http://localhost:8082/actuator/health"
print_service_status "Inventory Service" 8083 "http://localhost:8083/actuator/health"

# Check Frontend Applications
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📱 Frontend Applications:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_service_status "Admin POS" 3000
print_service_status "Customer App" 3002
print_service_status "Kitchen Display" 3003

# Service URLs
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🌐 Service URLs:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${YELLOW}Backend Services:${NC}"
echo -e "   Config Server:      http://localhost:8762"
echo -e "   Eureka Dashboard:   http://localhost:8761"
echo -e "   API Gateway:        http://localhost:8080"
echo -e "   User Service:       http://localhost:8081"
echo -e "   Order Service:      http://localhost:8082"
echo -e "   Inventory Service:  http://localhost:8083"

echo ""
echo -e "${YELLOW}Frontend Applications:${NC}"
echo -e "   Admin POS:          http://localhost:3000"
echo -e "   Customer App:       http://localhost:3002"
echo -e "   Kitchen Display:    http://localhost:3003"

echo ""
echo -e "${YELLOW}Health Checks:${NC}"
echo -e "   API Gateway Health: http://localhost:8080/actuator/health"
echo -e "   User Service:       http://localhost:8081/actuator/health"
echo -e "   Order Service:      http://localhost:8082/actuator/health"
echo -e "   Inventory Service:  http://localhost:8083/actuator/health"

# Quick API Test
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🧪 Quick API Test:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if check_port 8080; then
    echo ""
    echo -e "${YELLOW}Testing API Gateway endpoints:${NC}"

    # Test categories endpoint
    categories_status=$(check_http "http://localhost:8080/api/categories")
    if [ "$categories_status" == "200" ]; then
        echo -e "   ${GREEN}✓${NC} GET /api/categories - ${GREEN}OK (200)${NC}"
    else
        echo -e "   ${RED}✗${NC} GET /api/categories - ${RED}Failed ($categories_status)${NC}"
    fi

    # Test menu-items endpoint
    menu_status=$(check_http "http://localhost:8080/api/menu-items")
    if [ "$menu_status" == "200" ]; then
        echo -e "   ${GREEN}✓${NC} GET /api/menu-items - ${GREEN}OK (200)${NC}"
    else
        echo -e "   ${RED}✗${NC} GET /api/menu-items - ${RED}Failed ($menu_status)${NC}"
    fi

    # Test orders endpoint
    orders_status=$(check_http "http://localhost:8080/api/orders")
    if [ "$orders_status" == "200" ]; then
        echo -e "   ${GREEN}✓${NC} GET /api/orders - ${GREEN}OK (200)${NC}"
    else
        echo -e "   ${RED}✗${NC} GET /api/orders - ${RED}Failed ($orders_status)${NC}"
    fi
else
    echo -e "   ${RED}✗${NC} API Gateway is not running - cannot test endpoints"
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Count running services
TOTAL_SERVICES=9  # 6 backend + 3 frontend
RUNNING_COUNT=0

for port in 8762 8761 8080 8081 8082 8083 3000 3002 3003; do
    if check_port $port; then
        ((RUNNING_COUNT++))
    fi
done

if [ $RUNNING_COUNT -eq $TOTAL_SERVICES ]; then
    echo -e "${GREEN}✅ All services are running! ($RUNNING_COUNT/$TOTAL_SERVICES)${NC}"
elif [ $RUNNING_COUNT -eq 0 ]; then
    echo -e "${RED}❌ No services are running ($RUNNING_COUNT/$TOTAL_SERVICES)${NC}"
    echo -e "   Run ${YELLOW}./start-all.sh${NC} to start all services"
else
    echo -e "${YELLOW}⚠️  Some services are running ($RUNNING_COUNT/$TOTAL_SERVICES)${NC}"
    echo -e "   Run ${YELLOW}./start-all.sh${NC} to start all services"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
