#!/bin/bash

###############################################################################
# Garbaking POS - Interactive Log Viewer
# Advanced log viewing with filtering, search, and monitoring
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOGS_DIR="$SCRIPT_DIR/logs/latest"

# Check if logs directory exists
if [ ! -d "$LOGS_DIR" ]; then
    echo -e "${RED}No active log session found${NC}"
    echo "Logs directory: $LOGS_DIR does not exist"
    exit 1
fi

# Get available services
get_services() {
    local services=()
    for log in "$LOGS_DIR"/*.log; do
        if [ -f "$log" ]; then
            local service=$(basename "$log" .log)
            if [ "$service" != "aggregated" ] && [ "$service" != "build" ]; then
                services+=("$service")
            fi
        fi
    done
    echo "${services[@]}"
}

SERVICES=($(get_services))

# Display usage
usage() {
    cat << EOF
${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}
${CYAN}║          GARBAKING POS - INTERACTIVE LOG VIEWER               ║${NC}
${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}

${GREEN}Usage:${NC} $0 [OPTIONS] [SERVICE]

${GREEN}Options:${NC}
  -f, --follow              Follow logs in real-time
  -e, --errors              Show only errors and exceptions
  -w, --warnings            Show only warnings
  -s, --search PATTERN      Search for specific pattern
  -n, --lines NUM           Number of lines to display (default: 50)
  -l, --level LEVEL         Filter by log level (INFO, WARN, ERROR, DEBUG)
  -a, --all                 View aggregated logs from all services
  -t, --tail NUM            Show last NUM lines (default: 50)
  --since DURATION          Show logs since duration (e.g., 5m, 1h, 2d)
  --between START END       Show logs between timestamps
  --stats                   Show log statistics
  --json                    Output in JSON format (for parsing)
  -h, --help                Show this help message

${GREEN}Services:${NC}
$(printf "  - %s\n" "${SERVICES[@]}")
  - aggregated (all services combined)
  - build (build logs)

${GREEN}Examples:${NC}
  $0 --follow user-service              # Follow user service logs
  $0 -e api-gateway                     # Show only errors from API gateway
  $0 -s "NullPointerException"          # Search for specific exception
  $0 --all --errors                     # Show all errors across services
  $0 --stats                            # Show statistics for all services
  $0 --since 1h order-service           # Show order service logs from last hour
  $0 -n 100 -l ERROR                    # Show last 100 ERROR level logs

${GREEN}Interactive Mode:${NC}
  Run without arguments to enter interactive menu

EOF
}

# Parse command line arguments
FOLLOW=false
FILTER_LEVEL=""
SEARCH_PATTERN=""
NUM_LINES=50
VIEW_ALL=false
SHOW_STATS=false
OUTPUT_JSON=false
SERVICE=""
SINCE_DURATION=""
BETWEEN_START=""
BETWEEN_END=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -e|--errors)
            FILTER_LEVEL="ERROR"
            shift
            ;;
        -w|--warnings)
            FILTER_LEVEL="WARN"
            shift
            ;;
        -l|--level)
            FILTER_LEVEL="$2"
            shift 2
            ;;
        -s|--search)
            SEARCH_PATTERN="$2"
            shift 2
            ;;
        -n|--lines|-t|--tail)
            NUM_LINES="$2"
            shift 2
            ;;
        -a|--all)
            VIEW_ALL=true
            shift
            ;;
        --stats)
            SHOW_STATS=true
            shift
            ;;
        --json)
            OUTPUT_JSON=true
            shift
            ;;
        --since)
            SINCE_DURATION="$2"
            shift 2
            ;;
        --between)
            BETWEEN_START="$2"
            BETWEEN_END="$3"
            shift 3
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            SERVICE="$1"
            shift
            ;;
    esac
done

# Color coding for log levels
colorize_log() {
    local line="$1"
    
    if echo "$line" | grep -q "ERROR\|Exception\|exception\|FATAL"; then
        echo -e "${RED}$line${NC}"
    elif echo "$line" | grep -q "WARN\|WARNING"; then
        echo -e "${YELLOW}$line${NC}"
    elif echo "$line" | grep -q "INFO"; then
        echo -e "${GREEN}$line${NC}"
    elif echo "$line" | grep -q "DEBUG"; then
        echo -e "${MAGENTA}$line${NC}"
    else
        echo "$line"
    fi
}

# Filter logs by level
filter_by_level() {
    if [ -n "$FILTER_LEVEL" ]; then
        grep -i "$FILTER_LEVEL"
    else
        cat
    fi
}

# Filter logs by pattern
filter_by_pattern() {
    if [ -n "$SEARCH_PATTERN" ]; then
        grep -i "$SEARCH_PATTERN"
    else
        cat
    fi
}

# Filter logs by time
filter_by_time() {
    if [ -n "$SINCE_DURATION" ]; then
        # Convert duration to seconds
        local seconds=0
        if [[ "$SINCE_DURATION" =~ ^([0-9]+)m$ ]]; then
            seconds=$((${BASH_REMATCH[1]} * 60))
        elif [[ "$SINCE_DURATION" =~ ^([0-9]+)h$ ]]; then
            seconds=$((${BASH_REMATCH[1]} * 3600))
        elif [[ "$SINCE_DURATION" =~ ^([0-9]+)d$ ]]; then
            seconds=$((${BASH_REMATCH[1]} * 86400))
        fi
        
        local cutoff=$(date -d "@$(($(date +%s) - seconds))" '+%Y-%m-%d %H:%M:%S')
        awk -v cutoff="$cutoff" '$0 >= "["cutoff {print}'
    elif [ -n "$BETWEEN_START" ] && [ -n "$BETWEEN_END" ]; then
        awk -v start="$BETWEEN_START" -v end="$BETWEEN_END" \
            '$0 >= "["start && $0 <= "["end {print}'
    else
        cat
    fi
}

# Show statistics
show_stats() {
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    LOG STATISTICS                              ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    for service in "${SERVICES[@]}" "aggregated"; do
        local log_file="$LOGS_DIR/${service}.log"
        if [ -f "$log_file" ]; then
            echo -e "${GREEN}Service: $service${NC}"
            echo "─────────────────────────────────────────────────────────────────"
            
            local total_lines=$(wc -l < "$log_file")
            local errors=$(grep -ci "ERROR\|Exception\|exception" "$log_file" || echo 0)
            local warnings=$(grep -ci "WARN" "$log_file" || echo 0)
            local info=$(grep -ci "INFO" "$log_file" || echo 0)
            local size=$(du -h "$log_file" | cut -f1)
            
            printf "  Total lines:    %'d\n" "$total_lines"
            printf "  File size:      %s\n" "$size"
            printf "  ${RED}Errors:         %'d${NC}\n" "$errors"
            printf "  ${YELLOW}Warnings:       %'d${NC}\n" "$warnings"
            printf "  ${GREEN}Info messages:  %'d${NC}\n" "$info"
            
            # Most common errors
            local common_errors=$(grep -i "ERROR\|Exception" "$log_file" 2>/dev/null | \
                sed 's/.*Exception: //' | sed 's/.*ERROR: //' | \
                sort | uniq -c | sort -rn | head -3)
            
            if [ -n "$common_errors" ]; then
                echo "  Top errors:"
                echo "$common_errors" | while read count error; do
                    echo "    [$count] ${error:0:60}..."
                done
            fi
            
            echo
        fi
    done
}

# View logs
view_logs() {
    local log_file="$1"
    local service_name=$(basename "$log_file" .log)
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Viewing: $service_name${NC}"
    echo -e "${CYAN}  Location: $log_file${NC}"
    if [ -n "$FILTER_LEVEL" ]; then
        echo -e "${CYAN}  Filter: Level=$FILTER_LEVEL${NC}"
    fi
    if [ -n "$SEARCH_PATTERN" ]; then
        echo -e "${CYAN}  Search: $SEARCH_PATTERN${NC}"
    fi
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo
    
    if [ "$FOLLOW" = true ]; then
        tail -f "$log_file" | filter_by_level | filter_by_pattern | while read line; do
            colorize_log "$line"
        done
    else
        tail -n "$NUM_LINES" "$log_file" | filter_by_time | filter_by_level | filter_by_pattern | while read line; do
            colorize_log "$line"
        done
    fi
}

# Interactive menu
interactive_menu() {
    while true; do
        clear
        echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║          GARBAKING POS - LOG VIEWER (Interactive)             ║${NC}"
        echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
        echo
        echo -e "${GREEN}Available Services:${NC}"
        
        local i=1
        for service in "${SERVICES[@]}"; do
            echo "  $i) $service"
            ((i++))
        done
        echo "  $i) aggregated (all services)"
        ((i++))
        echo "  $i) Show statistics"
        ((i++))
        echo "  q) Quit"
        echo
        read -p "Select service (number or 'q' to quit): " choice
        
        case $choice in
            q|Q)
                echo "Goodbye!"
                exit 0
                ;;
            $i)
                show_stats
                read -p "Press Enter to continue..."
                ;;
            *)
                if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#SERVICES[@]}" ]; then
                    local selected_service="${SERVICES[$((choice-1))]}"
                    
                    echo
                    echo "View options:"
                    echo "  1) View last 50 lines"
                    echo "  2) View last 100 lines"
                    echo "  3) Follow logs (real-time)"
                    echo "  4) Show only errors"
                    echo "  5) Search pattern"
                    read -p "Select option: " view_option
                    
                    case $view_option in
                        1) view_logs "$LOGS_DIR/${selected_service}.log" ;;
                        2) NUM_LINES=100; view_logs "$LOGS_DIR/${selected_service}.log" ;;
                        3) FOLLOW=true; view_logs "$LOGS_DIR/${selected_service}.log" ;;
                        4) FILTER_LEVEL="ERROR"; view_logs "$LOGS_DIR/${selected_service}.log" ;;
                        5)
                            read -p "Enter search pattern: " pattern
                            SEARCH_PATTERN="$pattern"
                            view_logs "$LOGS_DIR/${selected_service}.log"
                            ;;
                    esac
                    
                    if [ "$FOLLOW" != true ]; then
                        read -p "Press Enter to continue..."
                    fi
                elif [ "$choice" -eq $((${#SERVICES[@]} + 1)) ]; then
                    view_logs "$LOGS_DIR/aggregated.log"
                    read -p "Press Enter to continue..."
                fi
                ;;
        esac
    done
}

# Main execution
if [ "$SHOW_STATS" = true ]; then
    show_stats
    exit 0
fi

if [ -z "$SERVICE" ] && [ "$VIEW_ALL" = false ]; then
    interactive_menu
elif [ "$VIEW_ALL" = true ]; then
    view_logs "$LOGS_DIR/aggregated.log"
else
    # Validate service name
    if [ ! -f "$LOGS_DIR/${SERVICE}.log" ]; then
        echo -e "${RED}Service '$SERVICE' not found${NC}"
        echo "Available services: ${SERVICES[@]}"
        exit 1
    fi
    view_logs "$LOGS_DIR/${SERVICE}.log"
fi
