#!/bin/bash
# Restart all Garbaking POS applications
# This script stops and then starts all services

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Restarting Garbaking POS System        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Stop all services
echo -e "${YELLOW}🛑 Stopping all services...${NC}"
./stop-all.sh

echo ""
echo -e "${YELLOW}⏳ Waiting 3 seconds...${NC}"
sleep 3
echo ""

# Start all services
echo -e "${YELLOW}🚀 Starting all services...${NC}"
./start-all.sh
