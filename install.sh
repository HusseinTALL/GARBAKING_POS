#!/bin/bash

###############################################################################
# Garbaking POS - Enhanced Logging System Installer
# One-command setup for the complete logging system
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🥐  GARBAKING POS - ENHANCED LOGGING INSTALLER  🥐        ║
║                                                               ║
║     Complete Enterprise Logging & Monitoring System          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_info()   { echo -e "${BLUE}ℹ${NC} $1"; }
print_warn()   { echo -e "${YELLOW}⚠${NC} $1"; }
print_error()  { echo -e "${RED}✗${NC} $1"; }

# Check if running in correct directory
if [ ! -f "start-backend-enhanced.sh" ]; then
    print_error "Installer must be run from the directory containing the scripts"
    exit 1
fi

echo -e "${WHITE}Checking system requirements...${NC}\n"

# Check required commands
REQUIRED_COMMANDS=(bash chmod mkdir ln grep awk sed date)
MISSING_COMMANDS=()

for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if ! command -v $cmd &> /dev/null; then
        MISSING_COMMANDS+=("$cmd")
        print_error "Missing: $cmd"
    else
        print_status "Found: $cmd"
    fi
done

if [ ${#MISSING_COMMANDS[@]} -gt 0 ]; then
    echo
    print_error "Missing required commands. Please install: ${MISSING_COMMANDS[*]}"
    exit 1
fi

echo
echo -e "${WHITE}Setting up enhanced logging system...${NC}\n"

# Make scripts executable
print_info "Making scripts executable..."
chmod +x start-backend-enhanced.sh
chmod +x dashboard.sh
chmod +x view-logs.sh
chmod +x analyze-logs.sh
chmod +x rotate-logs.sh
print_status "Scripts are now executable"

# Create directory structure
print_info "Creating log directory structure..."
mkdir -p logs/archive/compressed
mkdir -p logs/reports
print_status "Directories created"

# Create helper scripts
print_info "Creating helper scripts..."

# Status check script
cat > status-check.sh << 'EOF'
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
EOF
chmod +x status-check.sh

# Stop services script
cat > stop-services.sh << 'EOF'
#!/bin/bash
LOGS_DIR="$(dirname "$0")/logs/latest"
if [ ! -d "$LOGS_DIR" ]; then
    echo "No active session found"
    exit 1
fi

echo "Stopping all services..."
for pidfile in "$LOGS_DIR"/*.pid; do
    if [ -f "$pidfile" ]; then
        service=$(basename "$pidfile" .pid)
        pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping $service (PID: $pid)..."
            kill -TERM "$pid" 2>/dev/null || true
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                kill -KILL "$pid" 2>/dev/null || true
            fi
        fi
    fi
done
echo "All services stopped"
EOF
chmod +x stop-services.sh

print_status "Helper scripts created"

# Create configuration file
print_info "Creating configuration file..."
cat > logging-config.env << 'EOF'
# Garbaking POS - Enhanced Logging Configuration
# Edit these values to customize behavior

# Health monitoring
HEALTH_CHECK_INTERVAL=30        # Seconds between health checks

# Log rotation
LOG_RETENTION_DAYS=30           # Days to keep logs
COMPRESSION_THRESHOLD_MB=10      # Compress logs larger than MB
AUTO_CLEANUP=false              # Automatic cleanup of old logs

# Dashboard
DASHBOARD_REFRESH_INTERVAL=2    # Seconds between dashboard refreshes

# Analysis
ERROR_THRESHOLD=10              # Alert if errors exceed this
WARN_THRESHOLD=50               # Alert if warnings exceed this
EOF
print_status "Configuration file created: logging-config.env"

echo
echo -e "${WHITE}Installation complete!${NC}\n"

# Display summary
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              INSTALLATION SUCCESSFUL                          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "${CYAN}Available Scripts:${NC}"
echo "  ${WHITE}Main Scripts:${NC}"
echo "    ./start-backend-enhanced.sh  - Start services with enhanced logging"
echo "    ./dashboard.sh               - Real-time monitoring dashboard ⭐"
echo "    ./view-logs.sh               - Interactive log viewer"
echo "    ./analyze-logs.sh            - Intelligent log analysis"
echo "    ./rotate-logs.sh             - Log rotation & cleanup"
echo
echo "  ${WHITE}Helper Scripts:${NC}"
echo "    ./status-check.sh            - Quick status check"
echo "    ./stop-services.sh           - Stop all services"
echo
echo -e "${CYAN}Documentation:${NC}"
echo "    QUICK_START.md               - Quick start guide"
echo "    LOGGING_README.md            - Comprehensive documentation"
echo "    IMPROVEMENTS.md              - What's new and improved"
echo
echo -e "${CYAN}Configuration:${NC}"
echo "    logging-config.env           - Customize behavior here"
echo

# Quick start guide
echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║                    QUICK START                                ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "${WHITE}1. Start your services:${NC}"
echo "   ./start-backend-enhanced.sh"
echo
echo -e "${WHITE}2. Open the dashboard:${NC}"
echo "   ./dashboard.sh"
echo
echo -e "${WHITE}3. That's it! You're monitoring like a pro.${NC}"
echo

# Next steps
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    NEXT STEPS                                 ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo
echo "  [ ] Read QUICK_START.md for common tasks"
echo "  [ ] Explore the interactive log viewer"
echo "  [ ] Run log analysis to see what's possible"
echo "  [ ] Setup automated log rotation"
echo "  [ ] Customize logging-config.env for your needs"
echo

# Tips
echo -e "${GREEN}💡 Pro Tips:${NC}"
echo "  • Press '?' in dashboard for help"
echo "  • Use --help flag on any script"
echo "  • Dashboard refreshes every 2 seconds automatically"
echo "  • Setup cron: ./rotate-logs.sh --setup-cron"
echo

# Warning about original script
if [ -f "start-backend.sh" ]; then
    echo -e "${YELLOW}⚠ Notice:${NC}"
    echo "  Found original start-backend.sh"
    echo "  Recommendation: Keep as backup, use start-backend-enhanced.sh"
    echo "  To rename: mv start-backend.sh start-backend-original.sh"
    echo
fi

# Offer to run demo
echo -e "${WHITE}═══════════════════════════════════════════════════════════════${NC}"
read -p "Would you like to see a quick demo? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo
    echo -e "${CYAN}Starting quick demo...${NC}\n"
    
    # Show help for main script
    echo -e "${WHITE}1. Enhanced startup script help:${NC}"
    ./start-backend-enhanced.sh --help
    echo
    read -p "Press Enter to continue..."
    echo
    
    # Show log viewer capabilities
    echo -e "${WHITE}2. Log viewer capabilities:${NC}"
    ./view-logs.sh --help
    echo
    read -p "Press Enter to continue..."
    echo
    
    # Show analyzer capabilities
    echo -e "${WHITE}3. Log analyzer capabilities:${NC}"
    ./analyze-logs.sh --help
    echo
    read -p "Press Enter to continue..."
    echo
    
    # Show rotation options
    echo -e "${WHITE}4. Log rotation options:${NC}"
    ./rotate-logs.sh --help
    echo
    
    echo -e "${GREEN}Demo complete!${NC}"
    echo
fi

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Ready to start? Run: ./start-backend-enhanced.sh${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo

print_status "Installation and setup complete!"
