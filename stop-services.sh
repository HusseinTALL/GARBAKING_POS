#!/bin/bash

# Garbaking POS - Stop All Services
# This script stops all running services

echo "🛑 Stopping Garbaking POS Services..."
echo ""

# Kill processes on specific ports
BACKEND_PORT=3001
ADMIN_PORT=3000
CUSTOMER_PORT=3002

# Function to kill process on port
kill_port() {
    local port=$1
    local name=$2

    if lsof -ti:$port >/dev/null 2>&1; then
        echo "🔄 Stopping $name (port $port)..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        echo "✅ $name stopped"
    else
        echo "ℹ️  $name is not running"
    fi
}

kill_port $BACKEND_PORT "Backend"
kill_port $ADMIN_PORT "Admin POS"
kill_port $CUSTOMER_PORT "Customer App"

# Also kill any node processes related to the project
echo ""
echo "🔄 Cleaning up any remaining processes..."
pkill -f "nodemon.*app.ts" 2>/dev/null || true
pkill -f "vite.*admin-pos" 2>/dev/null || true
pkill -f "vite.*customer-app" 2>/dev/null || true

echo ""
echo "✅ All services stopped"
echo ""
