#!/bin/bash

###############################################################################
# Garbaking POS - Enhanced Spring Boot Backend Startup Script
# Advanced logging, monitoring, and service management
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

# Ports and service definitions
declare -A SERVICES=(
    ["config-server"]="8762:config-server:config-server-1.0.0.jar"
    ["discovery-server"]="8761:discovery-server:discovery-server-1.0.0.jar"
    ["user-service"]="8081:user-service:user-service-1.0.0.jar"
    ["order-service"]="8082:order-service:order-service-1.0.0.jar"
    ["inventory-service"]="8083:inventory-service:inventory-service-1.0.0.jar"
    ["operations-service"]="8085:operations-service:operations-service-1.0.0.jar"
    ["analytics-service"]="8086:analytics-service:analytics-service-1.0.0.jar"
    ["api-gateway"]="8080:api-gateway:api-gateway-1.0.0.jar"
)

BACKEND_PORTS=(8762 8761 8081 8082 8083 8085 8086 8080)

declare -A SERVICE_PIDS
declare -A SERVICE_STATUS
declare -A SERVICE_START_TIME

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

# Health check function
check_service_health() {
    local service=$1
    local port=$2
    local pid=${SERVICE_PIDS[$service]}
    
    if ! kill -0 "$pid" 2>/dev/null; then
        SERVICE_STATUS[$service]="DEAD"
        return 1
    fi
    
    if curl -s "http://localhost:$port/actuator/health" | grep -q "UP" 2>/dev/null; then
        SERVICE_STATUS[$service]="HEALTHY"
        return 0
    elif nc -z localhost "$port" 2>/dev/null; then
        SERVICE_STATUS[$service]="RUNNING"
        return 0
    else
        SERVICE_STATUS[$service]="STARTING"
        return 2
    fi
}

# Monitor service logs for errors
monitor_service_logs() {
    local service=$1
    local log_file="$CURRENT_LOG_DIR/${service}.log"
    
    # Check for common error patterns
    if tail -50 "$log_file" | grep -i "error\|exception\|failed" | grep -v "INFO" >/dev/null 2>&1; then
        local error_count=$(tail -100 "$log_file" | grep -i "error\|exception" | wc -l)
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
    local services_to_stop=(api-gateway analytics-service operations-service inventory-service order-service user-service discovery-server config-server)
    
    for service in "${services_to_stop[@]}"; do
        if [ -n "${SERVICE_PIDS[$service]}" ]; then
            local pid=${SERVICE_PIDS[$service]}
            if kill -0 "$pid" 2>/dev/null; then
                print_info "Stopping $service (PID: $pid)..."
                kill -TERM "$pid" 2>/dev/null || true
                
                # Wait for graceful shutdown (max 10 seconds)
                for i in {1..10}; do
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

trap cleanup SIGINT SIGTERM

# Generate session summary
generate_session_summary() {
    local summary_file="$CURRENT_LOG_DIR/session_summary.txt"
    {
        echo "═══════════════════════════════════════════════════════"
        echo "  GARBAKING POS - SESSION SUMMARY"
        echo "═══════════════════════════════════════════════════════"
        echo "Session Start: $(date -r "$CURRENT_LOG_DIR" '+%Y-%m-%d %H:%M:%S')"
        echo "Session End:   $(date '+%Y-%m-%d %H:%M:%S')"
        echo
        echo "Service Status:"
        for service in "${!SERVICE_PIDS[@]}"; do
            local uptime=$(($(date +%s) - ${SERVICE_START_TIME[$service]}))
            printf "  %-20s Status: %-10s Uptime: %02d:%02d:%02d\n" \
                "$service" "${SERVICE_STATUS[$service]}" \
                $((uptime/3600)) $((uptime%3600/60)) $((uptime%60))
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
    docker-compose up -d mysql zookeeper kafka
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
    local service=$1
    local port=$2
    local module_dir=$3
    local jar_name=$4
    local extra_args=$5

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
    SERVICE_PIDS[$service]=$pid
    SERVICE_START_TIME[$service]=$(date +%s)
    SERVICE_STATUS[$service]="STARTING"
    
    log_with_timestamp "$service" "Started with PID $pid"
    
    # Update PID in log file
    sed -i "s/PID: Will be updated.../PID: $pid/" "$log_file"
    
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
        SERVICE_STATUS[$service]="FAILED"
        log_with_timestamp "$service" "FAILED TO START"
        exit 1
    fi
}

# Start services in correct order
start_service "config-server" 8762 "config-server" "config-server-1.0.0.jar" "--spring.cloud.config.enabled=false"
start_service "discovery-server" 8761 "discovery-server" "discovery-server-1.0.0.jar" "--spring.cloud.config.enabled=false"

print_info "Waiting for core services to be ready..."
sleep 10

start_service "user-service" 8081 "user-service" "user-service-1.0.0.jar" "--spring.cloud.config.enabled=false"
start_service "order-service" 8082 "order-service" "order-service-1.0.0.jar" "--spring.cloud.config.enabled=false"
start_service "inventory-service" 8083 "inventory-service" "inventory-service-1.0.0.jar" "--spring.cloud.config.enabled=false"
start_service "operations-service" 8085 "operations-service" "operations-service-1.0.0.jar" "--spring.cloud.config.enabled=false"
start_service "analytics-service" 8086 "analytics-service" "analytics-service-1.0.0.jar" "--spring.cloud.config.enabled=false"

print_info "Waiting for services to register with Eureka..."
sleep 10

start_service "api-gateway" 8080 "api-gateway" "api-gateway-1.0.0.jar" "--spring.cloud.config.enabled=false"

# Health check monitoring in background
if [ "$ENABLE_LOG_MONITORING" = true ]; then
    (
        while true; do
            sleep "$HEALTH_CHECK_INTERVAL"
            for service in "${!SERVICE_PIDS[@]}"; do
                IFS=':' read -r port module_dir jar_name <<< "${SERVICES[$service]}"
                check_service_health "$service" "$port"
                monitor_service_logs "$service"
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
    echo -e "${CYAN}Following aggregated logs (Ctrl+C to stop all services)...${NC}"
    echo
    tail -f "$AGGREGATED_LOG" "$CURRENT_LOG_DIR"/*.log
else
    log_with_timestamp "SYSTEM" "All services started successfully"
    print_info "Services are running. Press Ctrl+C to stop all services."
    wait
    cleanup
fi
