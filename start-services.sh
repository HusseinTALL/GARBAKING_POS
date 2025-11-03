#!/bin/bash

# Garbaking POS - Start All Services
# This script ensures the database is ready before starting the backend and frontend services

set -e

echo "🚀 Starting Garbaking POS Services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check if ports are already in use
echo "🔍 Checking ports..."
BACKEND_PORT=3001
ADMIN_PORT=3000
CUSTOMER_PORT=3002

if check_port $BACKEND_PORT; then
    echo -e "${YELLOW}⚠️  Port $BACKEND_PORT (backend) is already in use${NC}"
    echo "   Kill existing process? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}✅ Killed process on port $BACKEND_PORT${NC}"
        sleep 1
    else
        echo "   Skipping backend startup"
        SKIP_BACKEND=true
    fi
fi

# Setup backend database
echo ""
echo "📦 Setting up backend database..."
cd backend

# Check if database exists and is valid
if [ ! -f "dev.db" ] || [ $(stat -f%z "dev.db" 2>/dev/null || stat -c%s "dev.db" 2>/dev/null || echo "0") -lt 1000 ]; then
    echo -e "${YELLOW}⚠️  Database not found or invalid${NC}"
    echo "🔄 Running database setup..."

    if bash scripts/setup-database.sh; then
        echo -e "${GREEN}✅ Database setup complete${NC}"
    else
        echo -e "${RED}❌ Database setup failed${NC}"
        echo ""
        echo "🔧 Manual fix:"
        echo "   cd backend"
        echo "   npm install"
        echo "   npm run db:setup"
        echo ""
        exit 1
    fi
else
    echo "🔍 Checking database integrity..."
    if bash scripts/check-database.sh; then
        echo -e "${GREEN}✅ Database is valid${NC}"
    else
        echo -e "${YELLOW}⚠️  Database validation failed, running setup...${NC}"
        bash scripts/setup-database.sh || {
            echo -e "${RED}❌ Database setup failed${NC}"
            exit 1
        }
    fi
fi

cd ..

# Start backend
if [ "$SKIP_BACKEND" != "true" ]; then
    echo ""
    echo "🔄 Starting backend server on port $BACKEND_PORT..."
    cd backend
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
    cd ..

    # Wait for backend to be ready
    echo "⏳ Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend failed to start within 30 seconds${NC}"
            echo "   Check logs: tail -f logs/backend.log"
            exit 1
        fi
        sleep 1
    done
else
    echo -e "${YELLOW}⚠️  Skipping backend startup${NC}"
fi

# Start Admin POS
echo ""
echo "🔄 Starting Admin POS on port $ADMIN_PORT..."
cd frontend/admin-pos

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

npm run dev > ../../logs/admin-pos.log 2>&1 &
ADMIN_PID=$!
echo -e "${GREEN}✅ Admin POS started (PID: $ADMIN_PID)${NC}"
cd ../..

# Start Customer App
echo ""
echo "🔄 Starting Customer App on port $CUSTOMER_PORT..."
cd frontend/customer-app

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

npm run dev > ../../logs/customer-app.log 2>&1 &
CUSTOMER_PID=$!
echo -e "${GREEN}✅ Customer App started (PID: $CUSTOMER_PID)${NC}"
cd ../..

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 Service URLs:"
echo "   🔧 Backend API:     http://localhost:$BACKEND_PORT"
echo "   💚 Health Check:    http://localhost:$BACKEND_PORT/health"
echo "   👨‍💼 Admin POS:       http://localhost:$ADMIN_PORT"
echo "   🛒 Customer App:    http://localhost:$CUSTOMER_PORT"
echo ""
echo "📊 Process IDs:"
[ "$SKIP_BACKEND" != "true" ] && echo "   Backend:      $BACKEND_PID"
echo "   Admin POS:    $ADMIN_PID"
echo "   Customer App: $CUSTOMER_PID"
echo ""
echo "📝 Logs:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/admin-pos.log"
echo "   tail -f logs/customer-app.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop-services.sh"
echo ""
