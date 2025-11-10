#!/bin/bash

###############################################################################
# Garbaking POS - Log Analyzer
# Intelligent analysis of logs with error detection, pattern recognition
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOGS_DIR="$SCRIPT_DIR/logs/latest"
REPORT_DIR="$SCRIPT_DIR/logs/reports"

mkdir -p "$REPORT_DIR"

# Check if logs exist
if [ ! -d "$LOGS_DIR" ]; then
    echo -e "${RED}No active log session found${NC}"
    exit 1
fi

# Configuration
ERROR_THRESHOLD=10
WARN_THRESHOLD=50
RESPONSE_TIME_THRESHOLD=5000  # ms
MEMORY_THRESHOLD=80  # percentage

usage() {
    cat << EOF
${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}
${CYAN}║              GARBAKING POS - LOG ANALYZER                     ║${NC}
${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}

${GREEN}Usage:${NC} $0 [OPTIONS]

${GREEN}Options:${NC}
  --full                    Full analysis (default)
  --errors                  Analyze errors only
  --performance             Analyze performance metrics
  --security                Security-focused analysis
  --health                  Service health check
  --export                  Export report to file
  --format FORMAT           Output format (text, html, json)
  --service SERVICE         Analyze specific service
  -h, --help                Show this help

${GREEN}Examples:${NC}
  $0 --full                          # Run full analysis
  $0 --errors --service api-gateway  # Analyze API gateway errors
  $0 --export --format html          # Generate HTML report

EOF
}

# Print section header
section_header() {
    echo
    echo -e "${WHITE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║  $1${NC}"
    echo -e "${WHITE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Analyze errors
analyze_errors() {
    local service=$1
    local log_file="$LOGS_DIR/${service}.log"
    
    if [ ! -f "$log_file" ]; then
        return
    fi
    
    echo -e "${CYAN}Analyzing: $service${NC}"
    echo "─────────────────────────────────────────────────────────────────"
    
    # Count errors by type
    local total_errors=$(grep -ci "ERROR\|Exception" "$log_file" || echo 0)
    local null_pointer=$(grep -ci "NullPointerException" "$log_file" || echo 0)
    local timeout=$(grep -ci "TimeoutException\|timeout" "$log_file" || echo 0)
    local connection=$(grep -ci "ConnectionException\|Connection refused\|Connection reset" "$log_file" || echo 0)
    local sql=$(grep -ci "SQLException\|SQL" "$log_file" || echo 0)
    
    if [ "$total_errors" -eq 0 ]; then
        echo -e "${GREEN}✓ No errors found${NC}"
    else
        echo -e "${RED}✗ Total errors: $total_errors${NC}"
        
        if [ "$total_errors" -gt "$ERROR_THRESHOLD" ]; then
            echo -e "${RED}  ⚠ ERROR THRESHOLD EXCEEDED (threshold: $ERROR_THRESHOLD)${NC}"
        fi
        
        # Breakdown by type
        [ "$null_pointer" -gt 0 ] && echo -e "  ${RED}• NullPointerException: $null_pointer${NC}"
        [ "$timeout" -gt 0 ] && echo -e "  ${YELLOW}• Timeout errors: $timeout${NC}"
        [ "$connection" -gt 0 ] && echo -e "  ${YELLOW}• Connection errors: $connection${NC}"
        [ "$sql" -gt 0 ] && echo -e "  ${YELLOW}• SQL errors: $sql${NC}"
        
        # Extract unique error messages
        echo
        echo "  Most common errors:"
        grep -i "ERROR\|Exception" "$log_file" 2>/dev/null | \
            grep -oP '(Exception|Error): \K.*' | \
            sed 's/at .*//' | \
            sort | uniq -c | sort -rn | head -5 | \
            while read count msg; do
                echo "    [$count] ${msg:0:60}"
            done
        
        # Recent critical errors (last 10)
        echo
        echo "  Recent critical errors:"
        grep -i "ERROR\|FATAL\|Exception" "$log_file" | tail -10 | while read line; do
            # Extract timestamp and error
            if [[ $line =~ \[([0-9-]+ [0-9:]+)\] ]]; then
                timestamp="${BASH_REMATCH[1]}"
                error=$(echo "$line" | sed 's/.*\] //' | cut -c1-60)
                echo -e "    ${RED}[$timestamp]${NC} $error..."
            fi
        done
    fi
    echo
}

# Analyze performance
analyze_performance() {
    local service=$1
    local log_file="$LOGS_DIR/${service}.log"
    
    if [ ! -f "$log_file" ]; then
        return
    fi
    
    echo -e "${CYAN}Performance Analysis: $service${NC}"
    echo "─────────────────────────────────────────────────────────────────"
    
    # Startup time
    if grep -q "Started.*in" "$log_file"; then
        local startup_time=$(grep "Started.*in" "$log_file" | tail -1 | grep -oP 'in \K[0-9.]+')
        if [ -n "$startup_time" ]; then
            echo -e "  Startup time: ${GREEN}${startup_time}s${NC}"
        fi
    fi
    
    # Response times (if logged)
    if grep -qP "response.*time|duration.*ms" "$log_file"; then
        echo
        echo "  Response time analysis:"
        grep -iP "response.*time|duration.*ms" "$log_file" | \
            grep -oP '\d+\s*ms' | \
            sed 's/[^0-9]//g' | \
            awk '{
                sum+=$1; 
                if(NR==1) min=max=$1; 
                if($1<min) min=$1; 
                if($1>max) max=$1;
            } 
            END {
                if(NR>0) {
                    printf "    Average: %.0fms\n", sum/NR;
                    printf "    Min: %dms\n", min;
                    printf "    Max: %dms\n", max;
                }
            }'
    fi
    
    # Memory usage (if logged)
    if grep -qP "memory|heap" "$log_file"; then
        echo
        echo "  Memory observations:"
        grep -i "memory\|heap" "$log_file" | tail -3 | sed 's/^/    /'
    fi
    
    # Slow queries or operations
    local slow_ops=$(grep -i "slow\|taking.*seconds\|exceeded.*time" "$log_file" | wc -l)
    if [ "$slow_ops" -gt 0 ]; then
        echo
        echo -e "  ${YELLOW}⚠ Slow operations detected: $slow_ops${NC}"
        grep -i "slow\|taking.*seconds\|exceeded.*time" "$log_file" | tail -3 | sed 's/^/    /'
    fi
    
    echo
}

# Security analysis
analyze_security() {
    local service=$1
    local log_file="$LOGS_DIR/${service}.log"
    
    if [ ! -f "$log_file" ]; then
        return
    fi
    
    echo -e "${CYAN}Security Analysis: $service${NC}"
    echo "─────────────────────────────────────────────────────────────────"
    
    # Authentication failures
    local auth_failures=$(grep -ci "authentication.*failed\|unauthorized\|403\|401" "$log_file" || echo 0)
    [ "$auth_failures" -gt 0 ] && echo -e "  ${YELLOW}⚠ Authentication failures: $auth_failures${NC}"
    
    # SQL injection attempts
    local sql_injection=$(grep -ci "SQL.*injection\|union.*select\|drop.*table" "$log_file" || echo 0)
    [ "$sql_injection" -gt 0 ] && echo -e "  ${RED}⚠ Possible SQL injection attempts: $sql_injection${NC}"
    
    # Suspicious patterns
    local suspicious=$(grep -ci "malicious\|attack\|exploit\|vulnerability" "$log_file" || echo 0)
    [ "$suspicious" -gt 0 ] && echo -e "  ${RED}⚠ Suspicious activity: $suspicious${NC}"
    
    # Rate limiting
    local rate_limited=$(grep -ci "rate.*limit\|too many requests\|429" "$log_file" || echo 0)
    [ "$rate_limited" -gt 0 ] && echo -e "  ${YELLOW}ℹ Rate limit hits: $rate_limited${NC}"
    
    if [ "$auth_failures" -eq 0 ] && [ "$sql_injection" -eq 0 ] && [ "$suspicious" -eq 0 ]; then
        echo -e "  ${GREEN}✓ No security issues detected${NC}"
    fi
    
    echo
}

# Service health check
check_service_health() {
    local service=$1
    local log_file="$LOGS_DIR/${service}.log"
    local pid_file="$LOGS_DIR/${service}.pid"
    
    echo -e "${CYAN}Health Check: $service${NC}"
    echo "─────────────────────────────────────────────────────────────────"
    
    # Check if service is running
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "  ${GREEN}✓ Process running (PID: $pid)${NC}"
            
            # Check uptime
            local start_time=$(stat -f %B "$pid_file" 2>/dev/null || stat -c %Y "$pid_file" 2>/dev/null)
            if [ -n "$start_time" ]; then
                local uptime=$(($(date +%s) - start_time))
                local hours=$((uptime / 3600))
                local minutes=$(((uptime % 3600) / 60))
                local seconds=$((uptime % 60))
                echo -e "  ${GREEN}✓ Uptime: ${hours}h ${minutes}m ${seconds}s${NC}"
            fi
        else
            echo -e "  ${RED}✗ Process not running${NC}"
        fi
    else
        echo -e "  ${RED}✗ PID file not found${NC}"
    fi
    
    # Check for recent errors
    local recent_errors=$(tail -100 "$log_file" | grep -ci "ERROR\|Exception" || echo 0)
    if [ "$recent_errors" -gt 5 ]; then
        echo -e "  ${RED}⚠ Recent errors: $recent_errors (last 100 lines)${NC}"
    else
        echo -e "  ${GREEN}✓ Recent errors: $recent_errors${NC}"
    fi
    
    # Check for warnings
    local recent_warnings=$(tail -100 "$log_file" | grep -ci "WARN" || echo 0)
    if [ "$recent_warnings" -gt 20 ]; then
        echo -e "  ${YELLOW}⚠ Recent warnings: $recent_warnings (last 100 lines)${NC}"
    else
        echo -e "  ${GREEN}✓ Recent warnings: $recent_warnings${NC}"
    fi
    
    # Check last activity
    if [ -f "$log_file" ]; then
        local last_mod=$(stat -f %m "$log_file" 2>/dev/null || stat -c %Y "$log_file" 2>/dev/null)
        local now=$(date +%s)
        local idle=$((now - last_mod))
        
        if [ "$idle" -gt 300 ]; then  # 5 minutes
            echo -e "  ${YELLOW}⚠ No activity for $((idle / 60)) minutes${NC}"
        else
            echo -e "  ${GREEN}✓ Active (last activity: ${idle}s ago)${NC}"
        fi
    fi
    
    echo
}

# Generate summary report
generate_summary() {
    section_header "GARBAKING POS - LOG ANALYSIS SUMMARY"
    
    echo -e "${WHITE}Analysis Time:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${WHITE}Log Directory:${NC} $LOGS_DIR"
    echo
    
    # Count services
    local total_services=0
    local healthy_services=0
    local services_with_errors=0
    
    for log in "$LOGS_DIR"/*.log; do
        if [ -f "$log" ]; then
            local service=$(basename "$log" .log)
            if [ "$service" != "aggregated" ] && [ "$service" != "build" ]; then
                ((total_services++))
                
                local errors=$(grep -ci "ERROR\|Exception" "$log" || echo 0)
                if [ "$errors" -eq 0 ]; then
                    ((healthy_services++))
                else
                    ((services_with_errors++))
                fi
            fi
        fi
    done
    
    echo -e "${WHITE}Services Overview:${NC}"
    echo "  Total services: $total_services"
    echo -e "  ${GREEN}Healthy: $healthy_services${NC}"
    echo -e "  ${RED}With errors: $services_with_errors${NC}"
    echo
    
    # Overall health score
    local health_score=$((healthy_services * 100 / total_services))
    echo -e "${WHITE}Overall Health Score:${NC} "
    if [ "$health_score" -ge 90 ]; then
        echo -e "  ${GREEN}$health_score% - EXCELLENT${NC}"
    elif [ "$health_score" -ge 70 ]; then
        echo -e "  ${YELLOW}$health_score% - GOOD${NC}"
    elif [ "$health_score" -ge 50 ]; then
        echo -e "  ${YELLOW}$health_score% - FAIR${NC}"
    else
        echo -e "  ${RED}$health_score% - POOR${NC}"
    fi
}

# Export report
export_report() {
    local format=$1
    local output_file="$REPORT_DIR/analysis_$(date +%Y%m%d_%H%M%S).$format"
    
    echo -e "${CYAN}Generating $format report...${NC}"
    
    case $format in
        html)
            {
                cat << 'HTMLEOF'
<!DOCTYPE html>
<html>
<head>
    <title>Garbaking POS - Log Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .stat { display: inline-block; margin: 10px; padding: 15px; background: #ecf0f1; border-radius: 5px; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        .success { color: #27ae60; }
        .service-section { margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; background: #f8f9fa; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #34495e; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🥐 Garbaking POS - Log Analysis Report</h1>
        <p><strong>Generated:</strong> $(date '+%Y-%m-%d %H:%M:%S')</p>
HTMLEOF
                
                # Add service summaries
                echo "<h2>Service Summary</h2>"
                echo "<table><tr><th>Service</th><th>Status</th><th>Errors</th><th>Warnings</th></tr>"
                
                for log in "$LOGS_DIR"/*.log; do
                    if [ -f "$log" ]; then
                        local service=$(basename "$log" .log)
                        if [ "$service" != "aggregated" ] && [ "$service" != "build" ]; then
                            local errors=$(grep -ci "ERROR\|Exception" "$log" || echo 0)
                            local warnings=$(grep -ci "WARN" "$log" || echo 0)
                            local status="<span class='success'>Healthy</span>"
                            [ "$errors" -gt 0 ] && status="<span class='error'>Has Errors</span>"
                            
                            echo "<tr><td>$service</td><td>$status</td><td>$errors</td><td>$warnings</td></tr>"
                        fi
                    fi
                done
                
                echo "</table></div></body></html>"
            } > "$output_file"
            ;;
        json)
            {
                echo "{"
                echo "  \"timestamp\": \"$(date -Iseconds)\","
                echo "  \"services\": ["
                
                local first=true
                for log in "$LOGS_DIR"/*.log; do
                    if [ -f "$log" ]; then
                        local service=$(basename "$log" .log)
                        if [ "$service" != "aggregated" ] && [ "$service" != "build" ]; then
                            [ "$first" = false ] && echo ","
                            first=false
                            
                            local errors=$(grep -ci "ERROR\|Exception" "$log" || echo 0)
                            local warnings=$(grep -ci "WARN" "$log" || echo 0)
                            
                            echo "    {"
                            echo "      \"name\": \"$service\","
                            echo "      \"errors\": $errors,"
                            echo "      \"warnings\": $warnings"
                            echo -n "    }"
                        fi
                    fi
                done
                
                echo
                echo "  ]"
                echo "}"
            } > "$output_file"
            ;;
    esac
    
    echo -e "${GREEN}✓ Report saved to: $output_file${NC}"
}

# Main execution
ANALYSIS_TYPE="full"
EXPORT_REPORT=false
EXPORT_FORMAT="text"
TARGET_SERVICE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --full) ANALYSIS_TYPE="full"; shift ;;
        --errors) ANALYSIS_TYPE="errors"; shift ;;
        --performance) ANALYSIS_TYPE="performance"; shift ;;
        --security) ANALYSIS_TYPE="security"; shift ;;
        --health) ANALYSIS_TYPE="health"; shift ;;
        --export) EXPORT_REPORT=true; shift ;;
        --format) EXPORT_FORMAT="$2"; shift 2 ;;
        --service) TARGET_SERVICE="$2"; shift 2 ;;
        -h|--help) usage; exit 0 ;;
        *) shift ;;
    esac
done

clear
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          GARBAKING POS - INTELLIGENT LOG ANALYZER            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

generate_summary

# Perform analysis
if [ -n "$TARGET_SERVICE" ]; then
    SERVICES=("$TARGET_SERVICE")
else
    SERVICES=()
    for log in "$LOGS_DIR"/*.log; do
        if [ -f "$log" ]; then
            service=$(basename "$log" .log)
            if [ "$service" != "aggregated" ] && [ "$service" != "build" ]; then
                SERVICES+=("$service")
            fi
        fi
    done
fi

case $ANALYSIS_TYPE in
    errors)
        section_header "ERROR ANALYSIS"
        for service in "${SERVICES[@]}"; do
            analyze_errors "$service"
        done
        ;;
    performance)
        section_header "PERFORMANCE ANALYSIS"
        for service in "${SERVICES[@]}"; do
            analyze_performance "$service"
        done
        ;;
    security)
        section_header "SECURITY ANALYSIS"
        for service in "${SERVICES[@]}"; do
            analyze_security "$service"
        done
        ;;
    health)
        section_header "SERVICE HEALTH CHECK"
        for service in "${SERVICES[@]}"; do
            check_service_health "$service"
        done
        ;;
    full)
        section_header "ERROR ANALYSIS"
        for service in "${SERVICES[@]}"; do
            analyze_errors "$service"
        done
        
        section_header "PERFORMANCE ANALYSIS"
        for service in "${SERVICES[@]}"; do
            analyze_performance "$service"
        done
        
        section_header "SERVICE HEALTH CHECK"
        for service in "${SERVICES[@]}"; do
            check_service_health "$service"
        done
        ;;
esac

# Export if requested
if [ "$EXPORT_REPORT" = true ]; then
    echo
    export_report "$EXPORT_FORMAT"
fi

echo
echo -e "${GREEN}Analysis complete!${NC}"
