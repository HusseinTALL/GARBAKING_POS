#!/bin/bash

###############################################################################
# Garbaking POS - Backend Startup Script
# Ensures the backend starts reliably and handles common errors
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
ENV_FILE="$BACKEND_DIR/.env"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🥐 Garbaking POS Backend Startup            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"
print_status "Changed to backend directory"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$ENV_FILE"
        print_status ".env file created"
    else
        print_error ".env.example not found!"
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
    print_status "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Check if database file exists
DB_PATH="$BACKEND_DIR/prisma/dev.db"
if [ ! -f "$DB_PATH" ]; then
    print_warning "Database not found. Running Prisma setup..."
    npx prisma generate
    npx prisma db push --accept-data-loss
    print_status "Database initialized"
else
    print_status "Database exists"
fi

# Create uploads directory if it doesn't exist
mkdir -p "$BACKEND_DIR/public/uploads/menu"
mkdir -p "$BACKEND_DIR/public/uploads/categories"
print_status "Upload directories ready"

# Kill any existing backend process on port 3001
print_info "Checking for existing backend process on port 3001..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    print_warning "Port 3001 is in use. Killing existing process..."
    kill -9 $(lsof -t -i:3001) 2>/dev/null || true
    sleep 2
    print_status "Existing process terminated"
else
    print_status "Port 3001 is available"
fi

# Start the backend
echo
print_info "Starting backend server..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# Use npm run dev for development (with auto-reload)
npm run dev &
BACKEND_PID=$!

# Wait a bit and check if it started successfully
sleep 5

if kill -0 $BACKEND_PID 2>/dev/null; then
    echo
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    print_status "Backend started successfully!"
    echo
    print_info "Backend PID: $BACKEND_PID"
    print_info "Backend URL: http://localhost:3001"
    print_info "Health Check: http://localhost:3001/health"
    print_info "API Endpoint: http://localhost:3001/api"
    echo
    print_info "Press Ctrl+C to stop the backend"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Wait for the process
    wait $BACKEND_PID
else
    print_error "Failed to start backend!"
    exit 1
fi
