#!/bin/bash

###############################################################################
# Garbaking POS - Full Stack Startup Script
# Starts backend and all frontend applications
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
BACKEND_DIR="$SCRIPT_DIR/backend"
ADMIN_DIR="$SCRIPT_DIR/frontend/admin-pos"
CUSTOMER_DIR="$SCRIPT_DIR/frontend/customer-app"
KDS_DIR="$SCRIPT_DIR/frontend/kds-app"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🥐  GARBAKING POS - FULL STACK STARTUP  🥐          ║"
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
    for pid in "${PIDS[@]}"; do
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null || true
        fi
    done

    # Kill any remaining processes on our ports
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    lsof -ti:3003 | xargs kill -9 2>/dev/null || true

    print_status "All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Create logs directory
mkdir -p "$SCRIPT_DIR/logs"

# Check and kill existing processes
print_info "Checking for existing processes..."
for port in 3001 3000 3002 3003; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Port $port is in use. Killing existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
done
print_status "All ports are available"

# Start Backend
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Backend Server (Port 3001)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BACKEND_DIR"

# Ensure .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        print_status ".env file created"
    fi
fi

# Ensure database exists
if [ ! -f "$BACKEND_DIR/prisma/dev.db" ]; then
    print_warning "Database not found. Initializing..."
    npx prisma generate > /dev/null 2>&1
    npx prisma db push --accept-data-loss > /dev/null 2>&1
    print_status "Database initialized"
fi

# Ensure uploads directory exists
mkdir -p "$BACKEND_DIR/public/uploads/menu"
mkdir -p "$BACKEND_DIR/public/uploads/categories"

npm run dev > "$SCRIPT_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!
PIDS+=($BACKEND_PID)
sleep 5

if kill -0 $BACKEND_PID 2>/dev/null; then
    print_status "Backend started (PID: $BACKEND_PID)"
else
    print_error "Failed to start backend"
    cat "$SCRIPT_DIR/logs/backend.log"
    exit 1
fi

# Start Admin POS
echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Starting Admin POS (Port 3000)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$ADMIN_DIR"
npm run dev > "$SCRIPT_DIR/logs/admin-pos.log" 2>&1 &
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
npm run dev > "$SCRIPT_DIR/logs/customer-app.log" 2>&1 &
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
npm run dev > "$SCRIPT_DIR/logs/kds-app.log" 2>&1 &
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
echo -e "${CYAN}📡 Backend API:${NC}       http://localhost:3001"
echo -e "${CYAN}   Health Check:${NC}      http://localhost:3001/health"
echo -e "${CYAN}   API Docs:${NC}          http://localhost:3001/api"
echo
echo -e "${CYAN}�� Admin POS:${NC}         http://localhost:3000"
echo -e "${CYAN}👥 Customer App:${NC}      http://localhost:3002"
echo -e "${CYAN}🍳 Kitchen Display:${NC}   http://localhost:3003"
echo
echo -e "${YELLOW}📋 Logs are saved in:${NC} $SCRIPT_DIR/logs/"
echo -e "${YELLOW}⌨️  Press Ctrl+C to stop all services${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Wait for all processes
wait
