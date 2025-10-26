#!/bin/bash
# Stop all Garbaking POS applications
# This script stops the backend API, admin POS, and customer app

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Stopping Garbaking POS System         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to kill process by PID file
kill_by_pidfile() {
    local pidfile=$1
    local service_name=$2

    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}🛑 Stopping $service_name (PID: $pid)...${NC}"
            kill $pid 2>/dev/null
            sleep 1
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null
            fi
            echo -e "   └─ ${GREEN}Stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name process not found${NC}"
        fi
        rm -f "$pidfile"
    fi
}

# Function to kill processes by port
kill_by_port() {
    local port=$1
    local service_name=$2

    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🛑 Stopping $service_name on port $port...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null
        echo -e "   └─ ${GREEN}Stopped${NC}"
    fi
}

# Stop services using PID files
if [ -d "logs" ]; then
    kill_by_pidfile "logs/backend.pid" "Backend API"
    kill_by_pidfile "logs/admin-pos.pid" "Admin POS"
    kill_by_pidfile "logs/customer-app.pid" "Customer App"
fi

# Also kill any processes on the ports (backup method)
echo ""
echo -e "${YELLOW}🧹 Cleaning up ports...${NC}"
kill_by_port 3001 "Backend API"
kill_by_port 3000 "Admin POS"
kill_by_port 3002 "Customer App"

# Kill any lingering node processes
echo ""
echo -e "${YELLOW}🧹 Cleaning up lingering processes...${NC}"
pkill -f "nodemon.*backend" 2>/dev/null
pkill -f "vite.*admin-pos" 2>/dev/null
pkill -f "vite.*customer-app" 2>/dev/null

sleep 2

# Verify all services are stopped
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 Port Status Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

check_port() {
    lsof -ti:$1 >/dev/null 2>&1
    return $?
}

if check_port 3001; then
    echo -e "⚠️  Port 3001: ${YELLOW}Still in use${NC}"
else
    echo -e "✅ Port 3001: ${GREEN}Free${NC}"
fi

if check_port 3000; then
    echo -e "⚠️  Port 3000: ${YELLOW}Still in use${NC}"
else
    echo -e "✅ Port 3000: ${GREEN}Free${NC}"
fi

if check_port 3002; then
    echo -e "⚠️  Port 3002: ${YELLOW}Still in use${NC}"
else
    echo -e "✅ Port 3002: ${GREEN}Free${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All services stopped!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🚀 To start all services again, run: ${YELLOW}./start-all.sh${NC}"
echo ""
