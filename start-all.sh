#!/bin/bash
# Start all Garbaking POS applications
# This script starts the backend API, admin POS, and customer app in the background

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Starting Garbaking POS System         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if processes are already running
check_port() {
    lsof -ti:$1 >/dev/null 2>&1
    return $?
}

# Kill any existing processes on our ports
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
sleep 2

# Create logs directory if it doesn't exist
mkdir -p logs

# Start Backend API Server
echo -e "${GREEN}🚀 Starting Backend API Server (Port 3001)...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..
echo -e "   └─ PID: $BACKEND_PID"
sleep 3

# Start Admin POS
echo -e "${GREEN}🖥️  Starting Admin POS (Port 3000)...${NC}"
cd frontend/admin-pos
npm run dev > ../../logs/admin-pos.log 2>&1 &
ADMIN_PID=$!
echo $ADMIN_PID > ../../logs/admin-pos.pid
cd ../..
echo -e "   └─ PID: $ADMIN_PID"
sleep 2

# Start Customer App
echo -e "${GREEN}📱 Starting Customer App (Port 3002)...${NC}"
cd frontend/customer-app
npm run dev > ../../logs/customer-app.log 2>&1 &
CUSTOMER_PID=$!
echo $CUSTOMER_PID > ../../logs/customer-app.pid
cd ../..
echo -e "   └─ PID: $CUSTOMER_PID"
sleep 3

# Check if all services are running
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 Service Status Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if check_port 3001; then
    echo -e "✅ Backend API:    ${GREEN}Running${NC} on http://localhost:3001"
else
    echo -e "❌ Backend API:    ${RED}Failed to start${NC}"
fi

if check_port 3000; then
    echo -e "✅ Admin POS:      ${GREEN}Running${NC} on http://localhost:3000"
else
    echo -e "❌ Admin POS:      ${RED}Failed to start${NC}"
fi

if check_port 3002; then
    echo -e "✅ Customer App:   ${GREEN}Running${NC} on http://localhost:3002"
else
    echo -e "❌ Customer App:   ${RED}Failed to start${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 All services started!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📝 Logs are being written to:"
echo -e "   • Backend:     logs/backend.log"
echo -e "   • Admin POS:   logs/admin-pos.log"
echo -e "   • Customer:    logs/customer-app.log"
echo ""
echo -e "🛑 To stop all services, run: ${YELLOW}./stop-all.sh${NC}"
echo -e "📊 To view logs, run: ${YELLOW}./view-logs.sh${NC}"
echo ""
