#!/bin/bash
# Check status of all Garbaking POS applications
# This script shows which services are running and their URLs

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Garbaking POS System Status             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Function to check if port is in use
check_port() {
    lsof -ti:$1 >/dev/null 2>&1
    return $?
}

# Function to get process info
get_process_info() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "$pid"
    else
        echo "N/A"
    fi
}

# Check Backend API
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 Backend API Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if check_port 3001; then
    PID=$(get_process_info 3001)
    echo -e "Status:  ${GREEN}● Running${NC}"
    echo -e "URL:     ${BLUE}http://localhost:3001${NC}"
    echo -e "PID:     $PID"
    echo -e "Health:  ${BLUE}http://localhost:3001/health${NC}"
else
    echo -e "Status:  ${RED}○ Stopped${NC}"
    echo -e "URL:     http://localhost:3001 (not available)"
fi

# Check Admin POS
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🖥️  Admin POS Application${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if check_port 3000; then
    PID=$(get_process_info 3000)
    echo -e "Status:  ${GREEN}● Running${NC}"
    echo -e "URL:     ${BLUE}http://localhost:3000${NC}"
    echo -e "PID:     $PID"
else
    echo -e "Status:  ${RED}○ Stopped${NC}"
    echo -e "URL:     http://localhost:3000 (not available)"
fi

# Check Customer App
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📱 Customer Application${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if check_port 3002; then
    PID=$(get_process_info 3002)
    echo -e "Status:  ${GREEN}● Running${NC}"
    echo -e "URL:     ${BLUE}http://localhost:3002${NC}"
    echo -e "PID:     $PID"
else
    echo -e "Status:  ${RED}○ Stopped${NC}"
    echo -e "URL:     http://localhost:3002 (not available)"
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RUNNING=0
STOPPED=0

check_port 3001 && ((RUNNING++)) || ((STOPPED++))
check_port 3000 && ((RUNNING++)) || ((STOPPED++))
check_port 3002 && ((RUNNING++)) || ((STOPPED++))

echo -e "Running services:  ${GREEN}$RUNNING${NC} / 3"
echo -e "Stopped services:  ${RED}$STOPPED${NC} / 3"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🛠️  Quick Commands${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Start all:    ${GREEN}./start-all.sh${NC}"
echo -e "Stop all:     ${RED}./stop-all.sh${NC}"
echo -e "Restart all:  ${YELLOW}./restart-all.sh${NC}"
echo -e "View logs:    ${BLUE}./view-logs.sh${NC}"
echo ""
