#!/bin/bash

###############################################################################
# Garbaking POS - Real-time Dashboard Monitor
# Live monitoring dashboard with service status, metrics, and log streaming
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOGS_DIR="$SCRIPT_DIR/logs/latest"
REFRESH_INTERVAL=2

# Check if logs exist
if [ ! -d "$LOGS_DIR" ]; then
    echo -e "${RED}No active session found. Start backend services first.${NC}"
    exit 1
fi

# Get terminal size
get_terminal_size() {
    TERM_WIDTH=$(tput cols)
    TERM_HEIGHT=$(tput lines)
}

# Get service status
get_service_status() {
    local service=$1
    local pid_file="$LOGS_DIR/${service}.pid"
    local log_file="$LOGS_DIR/${service}.log"
    
    if [ ! -f "$pid_file" ]; then
        echo "UNKNOWN"
        return
    fi
    
    local pid=$(cat "$pid_file")
    
    if ! kill -0 "$pid" 2>/dev/null; then
        echo "STOPPED"
        return
    fi
    
    # Check for recent errors
    local recent_errors=$(tail -50 "$log_file" 2>/dev/null | grep -ci "ERROR\|Exception" || echo 0)
    
    if [ "$recent_errors" -gt 10 ]; then
        echo "ERRORS"
    elif [ "$recent_errors" -gt 0 ]; then
        echo "WARNING"
    else
        echo "HEALTHY"
    fi
}

# Get service uptime
get_uptime() {
    local pid_file="$1"
    
    if [ ! -f "$pid_file" ]; then
        echo "N/A"
        return
    fi
    
    local start_time=$(stat -c %Y "$pid_file" 2>/dev/null || stat -f %m "$pid_file" 2>/dev/null)
    local uptime=$(($(date +%s) - start_time))
    
    local hours=$((uptime / 3600))
    local minutes=$(((uptime % 3600) / 60))
    local seconds=$((uptime % 60))
    
    printf "%02dh%02dm%02ds" "$hours" "$minutes" "$seconds"
}

# Get error count
get_error_count() {
    local log_file="$1"
    tail -100 "$log_file" 2>/dev/null | grep -ci "ERROR\|Exception" || echo 0
}

# Get CPU usage (if available)
get_cpu_usage() {
    local pid=$1
    
    if command -v ps &> /dev/null; then
        ps -p "$pid" -o %cpu= 2>/dev/null | awk '{print $1"%"}' || echo "N/A"
    else
        echo "N/A"
    fi
}

# Get memory usage (if available)
get_memory_usage() {
    local pid=$1
    
    if command -v ps &> /dev/null; then
        ps -p "$pid" -o rss= 2>/dev/null | awk '{printf "%.1fMB", $1/1024}' || echo "N/A"
    else
        echo "N/A"
    fi
}

# Draw header
draw_header() {
    clear
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                 🥐  GARBAKING POS - LIVE DASHBOARD MONITOR                    ║${NC}"
    echo -e "${CYAN}╠═══════════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC} ${WHITE}Session:${NC} $LOGS_DIR"
    echo -e "${CYAN}║${NC} ${WHITE}Updated:${NC} $timestamp"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Draw service table
draw_service_table() {
    echo -e "${WHITE}╔════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║                              SERVICE STATUS                                    ║${NC}"
    echo -e "${WHITE}╠════════════════╦═══════════╦═══════════╦═════════╦════════╦═════════╦═════════╣${NC}"
    printf "${WHITE}║${NC} %-14s ${WHITE}║${NC} %-9s ${WHITE}║${NC} %-9s ${WHITE}║${NC} %-7s ${WHITE}║${NC} %-6s ${WHITE}║${NC} %-7s ${WHITE}║${NC} %-7s ${WHITE}║${NC}\n" \
        "Service" "Status" "Uptime" "Errors" "CPU" "Memory" "PID"
    echo -e "${WHITE}╠════════════════╬═══════════╬═══════════╬═════════╬════════╬═════════╬═════════╣${NC}"
    
    # Service definitions
    local services=(
        "config-server:8762"
        "discovery:8761"
        "user-service:8081"
        "order-service:8082"
        "inventory:8083"
        "operations:8085"
        "analytics:8086"
        "api-gateway:8080"
    )
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r service port <<< "$service_info"
        local display_name=$(echo "$service" | cut -c1-14)
        local pid_file="$LOGS_DIR/${service}.pid"
        local log_file="$LOGS_DIR/${service}.log"
        
        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            local status=$(get_service_status "$service")
            local uptime=$(get_uptime "$pid_file")
            local errors=$(get_error_count "$log_file")
            local cpu=$(get_cpu_usage "$pid")
            local memory=$(get_memory_usage "$pid")
            
            # Color code status
            local status_color=$NC
            local status_symbol=""
            case $status in
                HEALTHY)
                    status_color=$GREEN
                    status_symbol="✓ "
                    ;;
                WARNING)
                    status_color=$YELLOW
                    status_symbol="⚠ "
                    ;;
                ERRORS)
                    status_color=$RED
                    status_symbol="✗ "
                    ;;
                STOPPED)
                    status_color=$GRAY
                    status_symbol="● "
                    ;;
                *)
                    status_color=$GRAY
                    status_symbol="? "
                    ;;
            esac
            
            # Color code errors
            local error_color=$GREEN
            if [ "$errors" -gt 10 ]; then
                error_color=$RED
            elif [ "$errors" -gt 0 ]; then
                error_color=$YELLOW
            fi
            
            printf "${WHITE}║${NC} %-14s ${WHITE}║${NC} ${status_color}%-9s${NC} ${WHITE}║${NC} %-9s ${WHITE}║${NC} ${error_color}%7s${NC} ${WHITE}║${NC} %6s ${WHITE}║${NC} %7s ${WHITE}║${NC} %7s ${WHITE}║${NC}\n" \
                "$display_name" "${status_symbol}${status}" "$uptime" "$errors" "$cpu" "$memory" "$pid"
        else
            printf "${WHITE}║${NC} %-14s ${WHITE}║${NC} ${GRAY}%-9s${NC} ${WHITE}║${NC} %-9s ${WHITE}║${NC} %7s ${WHITE}║${NC} %6s ${WHITE}║${NC} %7s ${WHITE}║${NC} %7s ${WHITE}║${NC}\n" \
                "$display_name" "NOT FOUND" "N/A" "N/A" "N/A" "N/A" "N/A"
        fi
    done
    
    echo -e "${WHITE}╚════════════════╩═══════════╩═══════════╩═════════╩════════╩═════════╩═════════╝${NC}"
    echo
}

# Draw system metrics
draw_system_metrics() {
    echo -e "${WHITE}╔════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║                            SYSTEM METRICS                                      ║${NC}"
    echo -e "${WHITE}╠════════════════════════════════════════════════════════════════════════════════╣${NC}"
    
    # Total errors across all services
    local total_errors=0
    for log in "$LOGS_DIR"/*.log; do
        if [ -f "$log" ]; then
            local service=$(basename "$log" .log)
            if [ "$service" != "aggregated" ] && [ "$service" != "build" ]; then
                local errors=$(tail -100 "$log" 2>/dev/null | grep -ci "ERROR\|Exception" || echo 0)
                ((total_errors+=errors))
            fi
        fi
    done
    
    # Total warnings
    local total_warnings=0
    for log in "$LOGS_DIR"/*.log; do
        if [ -f "$log" ]; then
            local service=$(basename "$log" .log)
            if [ "$service" != "aggregated" ] && [ "$service" != "build" ]; then
                local warnings=$(tail -100 "$log" 2>/dev/null | grep -ci "WARN" || echo 0)
                ((total_warnings+=warnings))
            fi
        fi
    done
    
    # Running services count
    local running_services=0
    local total_services=0
    for pid_file in "$LOGS_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            ((total_services++))
            local pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                ((running_services++))
            fi
        fi
    done
    
    # Disk usage
    local log_size=$(du -sh "$LOGS_DIR" 2>/dev/null | cut -f1 || echo "N/A")
    
    # Color code total errors
    local error_color=$GREEN
    if [ "$total_errors" -gt 50 ]; then
        error_color=$RED
    elif [ "$total_errors" -gt 10 ]; then
        error_color=$YELLOW
    fi
    
    printf "${WHITE}║${NC} Services: ${GREEN}%d${NC}/${GREEN}%d${NC} running" "$running_services" "$total_services"
    printf " │ Errors: ${error_color}%d${NC}" "$total_errors"
    printf " │ Warnings: ${YELLOW}%d${NC}" "$total_warnings"
    printf " │ Log Size: ${CYAN}%s${NC}" "$log_size"
    printf "${WHITE}                  ║${NC}\n"
    
    echo -e "${WHITE}╚════════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Draw recent activity
draw_recent_activity() {
    echo -e "${WHITE}╔════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║                           RECENT ACTIVITY                                      ║${NC}"
    echo -e "${WHITE}╚════════════════════════════════════════════════════════════════════════════════╝${NC}"
    
    # Get recent log entries from aggregated log
    if [ -f "$LOGS_DIR/aggregated.log" ]; then
        tail -10 "$LOGS_DIR/aggregated.log" | while IFS= read -r line; do
            # Color code based on content
            if echo "$line" | grep -qi "ERROR\|Exception"; then
                echo -e "${RED}${line:0:$((TERM_WIDTH-2))}${NC}"
            elif echo "$line" | grep -qi "WARN"; then
                echo -e "${YELLOW}${line:0:$((TERM_WIDTH-2))}${NC}"
            else
                echo -e "${GRAY}${line:0:$((TERM_WIDTH-2))}${NC}"
            fi
        done
    fi
    echo
}

# Draw controls
draw_controls() {
    echo -e "${GRAY}╔════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GRAY}║ Controls: [q] Quit  [r] Refresh  [e] Errors  [l] Logs  [a] Analysis  [?] Help ║${NC}"
    echo -e "${GRAY}╚════════════════════════════════════════════════════════════════════════════════╝${NC}"
}

# Main dashboard
main_dashboard() {
    # Hide cursor
    tput civis
    
    # Trap to show cursor on exit
    trap "tput cnorm; clear; exit" EXIT INT TERM
    
    while true; do
        get_terminal_size
        
        draw_header
        draw_service_table
        draw_system_metrics
        draw_recent_activity
        draw_controls
        
        # Non-blocking read for user input
        read -t $REFRESH_INTERVAL -n 1 key
        
        case $key in
            q|Q)
                break
                ;;
            r|R)
                continue
                ;;
            e|E)
                tput cnorm
                clear
                echo -e "${CYAN}Opening error logs...${NC}"
                "$SCRIPT_DIR/view-logs.sh" --errors --all
                tput civis
                ;;
            l|L)
                tput cnorm
                clear
                echo -e "${CYAN}Opening log viewer...${NC}"
                "$SCRIPT_DIR/view-logs.sh"
                tput civis
                ;;
            a|A)
                tput cnorm
                clear
                echo -e "${CYAN}Running analysis...${NC}"
                "$SCRIPT_DIR/analyze-logs.sh"
                read -p "Press Enter to continue..."
                tput civis
                ;;
            '?')
                tput cnorm
                clear
                cat << EOF
${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}
${CYAN}║              DASHBOARD HELP                                   ║${NC}
${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}

${GREEN}Keyboard Controls:${NC}
  q - Quit dashboard
  r - Force refresh
  e - View error logs
  l - Open interactive log viewer
  a - Run log analysis
  ? - Show this help

${GREEN}Status Colors:${NC}
  ${GREEN}✓ HEALTHY${NC}  - Service running with no recent errors
  ${YELLOW}⚠ WARNING${NC}  - Service has some warnings or minor errors
  ${RED}✗ ERRORS${NC}   - Service has significant errors
  ${GRAY}● STOPPED${NC}  - Service not running

${GREEN}Understanding Metrics:${NC}
  Uptime    - How long the service has been running
  Errors    - Count of errors in last 100 log lines
  CPU       - Current CPU usage percentage
  Memory    - Current memory usage (RSS)
  PID       - Process ID

${GREEN}Tips:${NC}
  • Dashboard auto-refreshes every ${REFRESH_INTERVAL} seconds
  • Press 'e' to quickly jump to error logs
  • Use 'l' for detailed log inspection
  • Run 'a' for comprehensive analysis

Press Enter to return to dashboard...
EOF
                read
                tput civis
                ;;
        esac
    done
    
    # Show cursor and clear screen on exit
    tput cnorm
    clear
    echo -e "${GREEN}Dashboard closed. Services continue running.${NC}"
}

# Check if required commands exist
for cmd in tput clear date; do
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}Error: Required command '$cmd' not found${NC}"
        exit 1
    fi
done

# Start dashboard
main_dashboard
