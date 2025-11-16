#!/usr/bin/env bash

###############################################################################
# Garbaking POS - Enhanced Spring Boot Backend Startup Script
# Advanced logging, monitoring, and service management
# Compatible with Bash 3.2+ (macOS compatible)
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/garbaking-backend"
LOGS_DIR="$SCRIPT_DIR/logs"
ARCHIVE_DIR="$LOGS_DIR/archive"
CURRENT_LOG_DIR="$LOGS_DIR/$(date +%Y%m%d_%H%M%S)"
AGGREGATED_LOG="$CURRENT_LOG_DIR/aggregated.log"

# Configuration
MAX_LOG_SIZE="100M"
LOG_RETENTION_DAYS=7
HEALTH_CHECK_INTERVAL=30
ENABLE_LOG_MONITORING=true
FOLLOW_LOGS_ON_START=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --follow|-f)
            FOLLOW_LOGS_ON_START=true
            shift
            ;;
        --no-monitor)
            ENABLE_LOG_MONITORING=false
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -f, --follow        Follow logs after startup"
            echo "  --no-monitor        Disable health monitoring"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Service definitions (Bash 3.2 compatible - using parallel arrays)
SERVICE_NAMES=(config-server discovery-server user-service order-service inventory-service operations-service analytics-service api-gateway)
SERVICE_PORTS=(8762 8761 8081 8082 8083 8085 8086 8080)
SERVICE_MODULES=(config-server discovery-server user-service order-service inventory-service operations-service analytics-service api-gateway)
SERVICE_JARS=(config-server-1.0.0.jar discovery-server-1.0.0.jar user-service-1.0.0.jar order-service-1.0.0.jar inventory-service-1.0.0.jar operations-service-1.0.0.jar analytics-service-1.0.0.jar api-gateway-1.0.0.jar)

BACKEND_PORTS=(8762 8761 8081 8082 8083 8085 8086 8080)

# PIDs tracking
SERVICE_PIDS=()
SERVICE_STATUS=()
SERVICE_START_TIME=()

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   🥐  GARBAKING POS - ENHANCED BACKEND STARTUP SYSTEM 🥐      ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Utility functions
print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_info()   { echo -e "${BLUE}ℹ${NC} $1"; }
print_warn()   { echo -e "${YELLOW}⚠${NC} $1"; }
print_error()  { echo -e "${RED}✗${NC} $1"; }
print_debug()  { echo -e "${MAGENTA}⚙${NC} $1"; }

# Create log directory structure
mkdir -p "$CURRENT_LOG_DIR"
mkdir -p "$ARCHIVE_DIR"

# Create a symlink to the latest logs
ln -sfn "$CURRENT_LOG_DIR" "$LOGS_DIR/latest"

# Logging functions
log_with_timestamp() {
    local service=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$service] $message" >> "$AGGREGATED_LOG"
}

# Archive old logs
archive_old_logs() {
    print_info "Archiving logs older than $LOG_RETENTION_DAYS days..."
    find "$LOGS_DIR" -maxdepth 1 -type d -name "20*" -mtime +$LOG_RETENTION_DAYS -exec mv {} "$ARCHIVE_DIR/" \; 2>/dev/null || true
    find "$ARCHIVE_DIR" -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null || true
    print_status "Log archival complete"
}

# Get service index by name
get_service_index() {
    local name=$1
    for i in "${!SERVICE_NAMES[@]}"; do
        if [ "${SERVICE_NAMES[$i]}" = "$name" ]; then
            echo "$i"
            return 0
        fi
    done
    echo "-1"
}

# Health check function
check_service_health() {
    local index=$1
    local service="${SERVICE_NAMES[$index]}"
    local port="${SERVICE_PORTS[$index]}"
    local pid="${SERVICE_PIDS[$index]}"

    if ! kill -0 "$pid" 2>/dev/null; then
        SERVICE_STATUS[$index]="DEAD"
        return 1
    fi

    if curl -s "http://localhost:$port/actuator/health" | grep -q "UP" 2>/dev/null; then
        SERVICE_STATUS[$index]="HEALTHY"
        return 0
    elif nc -z localhost "$port" 2>/dev/null; then
        SERVICE_STATUS[$index]="RUNNING"
        return 0
    else
        SERVICE_STATUS[$index]="STARTING"
        return 2
    fi
}

# Monitor service logs for errors
monitor_service_logs() {
    local service=$1
    local log_file="$CURRENT_LOG_DIR/${service}.log"

    # Check for common error patterns
    if tail -50 "$log_file" 2>/dev/null | grep -i "error\|exception\|failed" | grep -v "INFO" >/dev/null 2>&1; then
        local error_count=$(tail -100 "$log_file" 2>/dev/null | grep -i "error\|exception" | wc -l)
        if [ "$error_count" -gt 5 ]; then
            print_warn "$service has $error_count errors in recent logs"
        fi
    fi
}

# Enhanced cleanup
cleanup() {
    echo
    print_warn "Initiating graceful shutdown..."

    # Stop health monitoring
    if [ -n "$MONITOR_PID" ]; then
        kill "$MONITOR_PID" 2>/dev/null || true
    fi

    # Stop services in reverse order
    for ((i=${#SERVICE_NAMES[@]}-1; i>=0; i--)); do
        local service="${SERVICE_NAMES[$i]}"
        local pid="${SERVICE_PIDS[$i]}"

        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            print_info "Stopping $service (PID: $pid)..."
            kill -TERM "$pid" 2>/dev/null || true

            # Wait for graceful shutdown (max 10 seconds)
            for j in {1..10}; do
                if ! kill -0 "$pid" 2>/dev/null; then
                    print_status "$service stopped gracefully"
                    break
                fi
                sleep 1
            done

            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                kill -KILL "$pid" 2>/dev/null || true
                print_warn "$service force killed"
            fi
        fi
    done

    # Kill any remaining processes on backend ports
    for port in "${BACKEND_PORTS[@]}"; do
        lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
    done

    # Generate shutdown summary
    generate_session_summary

    print_status "All backend services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Generate session summary
generate_session_summary() {
    local summary_file="$CURRENT_LOG_DIR/session_summary.txt"

    # Get directory creation time (cross-platform)
    local session_start
    if [[ "$OSTYPE" == "darwin"* ]]; then
        session_start=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$CURRENT_LOG_DIR" 2>/dev/null || date '+%Y-%m-%d %H:%M:%S')
    else
        session_start=$(stat -c "%y" "$CURRENT_LOG_DIR" 2>/dev/null | cut -d'.' -f1 || date '+%Y-%m-%d %H:%M:%S')
    fi

    {
        echo "═══════════════════════════════════════════════════════"
        echo "  GARBAKING POS - SESSION SUMMARY"
        echo "═══════════════════════════════════════════════════════"
        echo "Session Start: $session_start"
        echo "Session End:   $(date '+%Y-%m-%d %H:%M:%S')"
        echo
        echo "Service Status:"
        for i in "${!SERVICE_NAMES[@]}"; do
            local service="${SERVICE_NAMES[$i]}"
            local status="${SERVICE_STATUS[$i]:-N/A}"
            local start_time="${SERVICE_START_TIME[$i]:-0}"
            if [ "$start_time" -gt 0 ]; then
                local uptime=$(($(date +%s) - $start_time))
                printf "  %-20s Status: %-10s Uptime: %02d:%02d:%02d\n" \
                    "$service" "$status" \
                    $((uptime/3600)) $((uptime%3600/60)) $((uptime%60))
            else
                printf "  %-20s Status: %-10s\n" "$service" "$status"
            fi
        done
        echo
        echo "Logs location: $CURRENT_LOG_DIR"
        echo "═══════════════════════════════════════════════════════"
    } > "$summary_file"

    cat "$summary_file"
}

# Pre-flight checks
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Spring Boot backend directory not found at $BACKEND_DIR"
    exit 1
fi

# Check for required tools
for tool in java lsof nc curl; do
    if ! command -v $tool &> /dev/null; then
        print_error "Required tool '$tool' not found. Please install it."
        exit 1
    fi
done

archive_old_logs

print_info "Checking for existing processes..."
for port in "${BACKEND_PORTS[@]}"; do
    if lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warn "Port $port in use. Terminating process..."
        lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
done
print_status "All backend ports are free"

print_info "Ensuring Docker infrastructure (MySQL, Kafka) is running..."
cd "$BACKEND_DIR"
if ! docker ps | grep -q "garbaking-mysql"; then
    print_warn "MySQL container not running. Starting docker-compose services..."
    docker-compose up -d mysql zookeeper kafka minio zipkin
    print_info "Waiting for MySQL to initialize..."
    sleep 15
else
    print_status "MySQL container is already running"
fi

if ! docker ps | grep -q "garbaking-kafka"; then
    print_warn "Kafka container not running. Starting..."
    docker-compose up -d zookeeper kafka
    print_info "Waiting for Kafka to be ready..."
    sleep 10
else
    print_status "Kafka container is already running"
fi

echo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
print_info "Building backend microservices (gradlew build -x test)..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
./gradlew build -x test 2>&1 | tee "$CURRENT_LOG_DIR/build.log"
print_status "Spring Boot services compiled successfully"

# Enhanced service starter
start_service() {
    local index=$1
    local service="${SERVICE_NAMES[$index]}"
    local port="${SERVICE_PORTS[$index]}"
    local module_dir="${SERVICE_MODULES[$index]}"
    local jar_name="${SERVICE_JARS[$index]}"
    local extra_args="--spring.cloud.config.enabled=false"

    echo
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    print_info "Starting $service (port $port)..."
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    cd "$BACKEND_DIR/$module_dir"
    if [ ! -f "build/libs/$jar_name" ]; then
        print_error "Jar build/libs/$jar_name not found for $service"
        exit 1
    fi

    local log_file="$CURRENT_LOG_DIR/${service}.log"
    local pid_file="$CURRENT_LOG_DIR/${service}.pid"

    # Start service with enhanced logging
    {
        echo "═══════════════════════════════════════════════════════"
        echo "Service: $service"
        echo "Started: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Port: $port"
        echo "PID: Will be updated..."
        echo "═══════════════════════════════════════════════════════"
    } > "$log_file"

    java -jar "build/libs/$jar_name" $extra_args >> "$log_file" 2>&1 &
    local pid=$!
    echo "$pid" > "$pid_file"
    SERVICE_PIDS[$index]=$pid
    SERVICE_START_TIME[$index]=$(date +%s)
    SERVICE_STATUS[$index]="STARTING"

    log_with_timestamp "$service" "Started with PID $pid"

    # Update PID in log file (macOS compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/PID: Will be updated.../PID: $pid/" "$log_file"
    else
        sed -i "s/PID: Will be updated.../PID: $pid/" "$log_file"
    fi

    sleep 8

    if kill -0 "$pid" 2>/dev/null; then
        print_status "$service started (PID: $pid)"

        # Check for immediate errors
        if grep -i "error\|exception" "$log_file" | grep -v "INFO" | head -5; then
            print_warn "$service started but has errors. Check $log_file"
        fi
    else
        print_error "$service failed to start. See $log_file"
        echo
        echo -e "${RED}━━━━━━━━━━━━━━━━━━ ERROR LOG ━━━━━━━━━━━━━━━━━━${NC}"
        tail -30 "$log_file"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        SERVICE_STATUS[$index]="FAILED"
        log_with_timestamp "$service" "FAILED TO START"
        exit 1
    fi
}

# Start services in correct order
start_service 0  # config-server
start_service 1  # discovery-server

print_info "Waiting for core services to be ready..."
sleep 10

start_service 2  # user-service
start_service 3  # order-service
start_service 4  # inventory-service
start_service 5  # operations-service
start_service 6  # analytics-service

print_info "Waiting for services to register with Eureka..."
sleep 10

start_service 7  # api-gateway

# Health check monitoring in background
if [ "$ENABLE_LOG_MONITORING" = true ]; then
    (
        while true; do
            sleep "$HEALTH_CHECK_INTERVAL"
            for i in "${!SERVICE_NAMES[@]}"; do
                check_service_health "$i"
                monitor_service_logs "${SERVICE_NAMES[$i]}"
            done
        done
    ) &
    MONITOR_PID=$!
fi

# Display startup summary
echo
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🎉  SPRING BOOT BACKEND IS RUNNING! 🎉        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo
echo -e "${CYAN}Service URLs:${NC}"
echo "  Config Server:      http://localhost:8762"
echo "  Discovery (Eureka): http://localhost:8761"
echo "  API Gateway:        http://localhost:8080"
echo "  User Service:       http://localhost:8081"
echo "  Order Service:      http://localhost:8082"
echo "  Inventory Service:  http://localhost:8083"
echo "  Operations Service: http://localhost:8085"
echo "  Analytics Service:  http://localhost:8086"
echo
echo -e "${CYAN}Logs:${NC}"
echo "  Current session:    $CURRENT_LOG_DIR"
echo "  Latest logs link:   $LOGS_DIR/latest"
echo "  Aggregated log:     $AGGREGATED_LOG"
echo
echo -e "${CYAN}Useful commands:${NC}"
echo "  View all logs:      tail -f $CURRENT_LOG_DIR/*.log"
echo "  View aggregated:    tail -f $AGGREGATED_LOG"
echo "  View specific:      tail -f $CURRENT_LOG_DIR/<service>.log"
echo "  Service status:     ./status-check.sh"
echo "  Stop services:      Ctrl+C"
echo


# Create status check script
cat > "$SCRIPT_DIR/status-check.sh" << 'STATUSEOF'
#!/bin/bash
LOGS_DIR="$(dirname "$0")/logs/latest"
if [ ! -d "$LOGS_DIR" ]; then
    echo "No active session found"
    exit 1
fi

echo "═══════════════════════════════════════════════════════"
echo "  GARBAKING POS - SERVICE STATUS"
echo "═══════════════════════════════════════════════════════"
for pidfile in "$LOGS_DIR"/*.pid; do
    if [ -f "$pidfile" ]; then
        service=$(basename "$pidfile" .pid)
        pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✓ $service (PID: $pid) - RUNNING"
        else
            echo "✗ $service - STOPPED"
        fi
    fi
done
echo "═══════════════════════════════════════════════════════"
STATUSEOF
chmod +x "$SCRIPT_DIR/status-check.sh"

# Follow logs if requested
if [ "$FOLLOW_LOGS_ON_START" = true ]; then
    echo -e "${CYAN}Following aggregated logs (Ctrl+C to stop monitoring, services will continue)...${NC}"
    echo
    tail -f "$AGGREGATED_LOG" "$CURRENT_LOG_DIR"/*.log
else
    log_with_timestamp "SYSTEM" "All services started successfully"
    print_info "Services are running. Press Ctrl+C to stop all services."
    wait
fi
