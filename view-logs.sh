#!/bin/bash
# View logs for Garbaking POS applications
# This script provides an interactive way to view logs from different services

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if logs directory exists
if [ ! -d "logs" ]; then
    echo -e "${RED}❌ No logs directory found. Start the services first with ./start-all.sh${NC}"
    exit 1
fi

# Function to show menu
show_menu() {
    clear
    echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     Garbaking POS - Log Viewer            ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Select a log to view:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} Backend API        (logs/backend.log)"
    echo -e "  ${GREEN}2)${NC} Admin POS          (logs/admin-pos.log)"
    echo -e "  ${GREEN}3)${NC} Customer App       (logs/customer-app.log)"
    echo -e "  ${GREEN}4)${NC} All logs (combined)"
    echo -e "  ${GREEN}5)${NC} Follow all logs (live tail)"
    echo -e "  ${RED}q)${NC} Quit"
    echo ""
    echo -n "Enter your choice: "
}

# Function to view a specific log
view_log() {
    local logfile=$1
    local service_name=$2

    if [ -f "$logfile" ]; then
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}📋 Viewing $service_name logs${NC}"
        echo -e "${YELLOW}Press 'q' to exit, Space/Enter to scroll${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        sleep 1
        less -R "$logfile"
    else
        echo -e "${RED}❌ Log file not found: $logfile${NC}"
        echo -e "   Start the service first with ./start-all.sh"
        echo ""
        read -p "Press Enter to continue..."
    fi
}

# Function to tail all logs
tail_all_logs() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📡 Live logs from all services${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Check which logs exist
    local tail_files=""
    [ -f "logs/backend.log" ] && tail_files="$tail_files logs/backend.log"
    [ -f "logs/admin-pos.log" ] && tail_files="$tail_files logs/admin-pos.log"
    [ -f "logs/customer-app.log" ] && tail_files="$tail_files logs/customer-app.log"

    if [ -z "$tail_files" ]; then
        echo -e "${RED}❌ No log files found. Start the services first with ./start-all.sh${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    tail -f $tail_files
}

# Function to show all logs combined
show_all_logs() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📋 Combined logs from all services${NC}"
    echo -e "${YELLOW}Press 'q' to exit, Space/Enter to scroll${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    sleep 1

    {
        [ -f "logs/backend.log" ] && echo -e "\n${GREEN}=== Backend API ===${NC}\n" && cat logs/backend.log
        [ -f "logs/admin-pos.log" ] && echo -e "\n${GREEN}=== Admin POS ===${NC}\n" && cat logs/admin-pos.log
        [ -f "logs/customer-app.log" ] && echo -e "\n${GREEN}=== Customer App ===${NC}\n" && cat logs/customer-app.log
    } | less -R
}

# Main loop
while true; do
    show_menu
    read choice

    case $choice in
        1)
            view_log "logs/backend.log" "Backend API"
            ;;
        2)
            view_log "logs/admin-pos.log" "Admin POS"
            ;;
        3)
            view_log "logs/customer-app.log" "Customer App"
            ;;
        4)
            show_all_logs
            ;;
        5)
            tail_all_logs
            ;;
        q|Q)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please try again.${NC}"
            sleep 1
            ;;
    esac
done
