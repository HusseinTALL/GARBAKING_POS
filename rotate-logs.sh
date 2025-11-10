#!/bin/bash

###############################################################################
# Garbaking POS - Log Rotation & Cleanup Utility
# Automated log rotation, compression, and cleanup
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOGS_DIR="$SCRIPT_DIR/logs"
ARCHIVE_DIR="$LOGS_DIR/archive"
COMPRESSED_DIR="$ARCHIVE_DIR/compressed"

# Configuration - can be overridden by command line
RETENTION_DAYS=30
COMPRESSION_THRESHOLD_MB=10
AUTO_CLEANUP=false
DRY_RUN=false

usage() {
    cat << EOF
${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}
${CYAN}║         GARBAKING POS - LOG ROTATION & CLEANUP                ║${NC}
${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}

${GREEN}Usage:${NC} $0 [OPTIONS]

${GREEN}Options:${NC}
  --retention DAYS          Days to keep logs (default: 30)
  --compress-threshold MB   Compress logs larger than MB (default: 10)
  --auto-cleanup            Automatically delete old compressed logs
  --dry-run                 Show what would be done without doing it
  --force                   Force cleanup without confirmation
  --setup-cron              Setup automated daily log rotation
  -h, --help                Show this help

${GREEN}Examples:${NC}
  $0                                    # Run with default settings
  $0 --retention 7 --auto-cleanup       # Keep 7 days, auto cleanup
  $0 --dry-run                          # Preview actions
  $0 --setup-cron                       # Setup automated rotation

EOF
}

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_info()   { echo -e "${BLUE}ℹ${NC} $1"; }
print_warn()   { echo -e "${YELLOW}⚠${NC} $1"; }
print_error()  { echo -e "${RED}✗${NC} $1"; }

# Parse arguments
FORCE=false
SETUP_CRON=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        --compress-threshold)
            COMPRESSION_THRESHOLD_MB="$2"
            shift 2
            ;;
        --auto-cleanup)
            AUTO_CLEANUP=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --setup-cron)
            SETUP_CRON=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Setup cron job
setup_cron_job() {
    print_info "Setting up automated log rotation..."
    
    local cron_script="$SCRIPT_DIR/log-rotation-cron.sh"
    local this_script="$SCRIPT_DIR/$(basename "$0")"
    
    # Create wrapper script
    cat > "$cron_script" << EOF
#!/bin/bash
# Automated log rotation for Garbaking POS
# Generated: $(date)

cd "$SCRIPT_DIR"
"$this_script" --retention $RETENTION_DAYS --auto-cleanup >> "$LOGS_DIR/rotation.log" 2>&1
EOF
    
    chmod +x "$cron_script"
    
    # Add to crontab (runs daily at 2 AM)
    local cron_entry="0 2 * * * $cron_script"
    
    # Check if entry already exists
    if crontab -l 2>/dev/null | grep -q "$cron_script"; then
        print_warn "Cron job already exists"
    else
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
        print_status "Cron job added: Daily log rotation at 2 AM"
    fi
    
    echo
    echo "To view cron jobs: crontab -l"
    echo "To remove cron job: crontab -e (then delete the line)"
    echo "Rotation log: $LOGS_DIR/rotation.log"
    
    exit 0
}

if [ "$SETUP_CRON" = true ]; then
    setup_cron_job
fi

# Initialize
mkdir -p "$ARCHIVE_DIR" "$COMPRESSED_DIR"

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         GARBAKING POS - LOG ROTATION & CLEANUP                ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

[ "$DRY_RUN" = true ] && echo -e "${YELLOW}DRY RUN MODE - No changes will be made${NC}\n"

print_info "Configuration:"
echo "  Logs directory:       $LOGS_DIR"
echo "  Archive directory:    $ARCHIVE_DIR"
echo "  Retention period:     $RETENTION_DAYS days"
echo "  Compression threshold: ${COMPRESSION_THRESHOLD_MB}MB"
echo "  Auto cleanup:         $AUTO_CLEANUP"
echo

# Collect statistics
total_size=$(du -sh "$LOGS_DIR" 2>/dev/null | cut -f1)
log_count=$(find "$LOGS_DIR" -type f -name "*.log" | wc -l)
archive_count=$(find "$ARCHIVE_DIR" -type d -name "20*" 2>/dev/null | wc -l)

echo -e "${CYAN}Current Status:${NC}"
echo "  Total log size:       $total_size"
echo "  Active log files:     $log_count"
echo "  Archived sessions:    $archive_count"
echo

# Function to get size in MB
get_size_mb() {
    local path="$1"
    du -sm "$path" 2>/dev/null | cut -f1
}

# Rotate old log sessions
rotate_logs() {
    print_info "Rotating old log sessions..."
    
    local rotated=0
    find "$LOGS_DIR" -maxdepth 1 -type d -name "20*" | while read session_dir; do
        local session_name=$(basename "$session_dir")
        local mod_time=$(stat -c %Y "$session_dir" 2>/dev/null || stat -f %m "$session_dir" 2>/dev/null)
        local age_days=$(( ($(date +%s) - mod_time) / 86400 ))
        
        if [ "$age_days" -gt 0 ]; then
            local size_mb=$(get_size_mb "$session_dir")
            
            echo -e "  ${YELLOW}→${NC} $session_name (${age_days}d old, ${size_mb}MB)"
            
            if [ "$DRY_RUN" = false ]; then
                # Move to archive if not already there
                if [ ! -d "$ARCHIVE_DIR/$session_name" ]; then
                    mv "$session_dir" "$ARCHIVE_DIR/"
                    ((rotated++))
                fi
            else
                ((rotated++))
            fi
        fi
    done
    
    if [ "$rotated" -gt 0 ]; then
        print_status "Rotated $rotated log session(s) to archive"
    else
        print_info "No log sessions to rotate"
    fi
    echo
}

# Compress large archives
compress_archives() {
    print_info "Compressing large archives (threshold: ${COMPRESSION_THRESHOLD_MB}MB)..."
    
    local compressed=0
    find "$ARCHIVE_DIR" -maxdepth 1 -type d -name "20*" | while read archive_dir; do
        local archive_name=$(basename "$archive_dir")
        local size_mb=$(get_size_mb "$archive_dir")
        
        if [ "$size_mb" -ge "$COMPRESSION_THRESHOLD_MB" ]; then
            echo -e "  ${YELLOW}→${NC} Compressing $archive_name (${size_mb}MB)..."
            
            if [ "$DRY_RUN" = false ]; then
                local tar_file="$COMPRESSED_DIR/${archive_name}.tar.gz"
                
                if [ ! -f "$tar_file" ]; then
                    tar -czf "$tar_file" -C "$ARCHIVE_DIR" "$archive_name" 2>/dev/null
                    
                    if [ $? -eq 0 ]; then
                        local compressed_size=$(du -sh "$tar_file" | cut -f1)
                        rm -rf "$archive_dir"
                        echo -e "    ${GREEN}✓${NC} Compressed to $compressed_size"
                        ((compressed++))
                    else
                        print_error "Failed to compress $archive_name"
                    fi
                fi
            else
                ((compressed++))
            fi
        fi
    done
    
    if [ "$compressed" -gt 0 ]; then
        print_status "Compressed $compressed archive(s)"
    else
        print_info "No archives need compression"
    fi
    echo
}

# Clean old compressed archives
cleanup_old_archives() {
    print_info "Cleaning up archives older than $RETENTION_DAYS days..."
    
    local deleted=0
    local freed_space=0
    
    # Clean old uncompressed archives
    find "$ARCHIVE_DIR" -maxdepth 1 -type d -name "20*" -mtime +$RETENTION_DAYS | while read old_dir; do
        local dir_name=$(basename "$old_dir")
        local size_mb=$(get_size_mb "$old_dir")
        
        echo -e "  ${RED}✗${NC} Removing $dir_name (${size_mb}MB)"
        
        if [ "$DRY_RUN" = false ]; then
            rm -rf "$old_dir"
            ((deleted++))
            ((freed_space+=size_mb))
        fi
    done
    
    # Clean old compressed archives
    find "$COMPRESSED_DIR" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS | while read old_archive; do
        local archive_name=$(basename "$old_archive")
        local size=$(du -sh "$old_archive" | cut -f1)
        
        echo -e "  ${RED}✗${NC} Removing $archive_name ($size)"
        
        if [ "$DRY_RUN" = false ]; then
            rm -f "$old_archive"
            ((deleted++))
        fi
    done
    
    if [ "$deleted" -gt 0 ]; then
        print_status "Cleaned up $deleted old archive(s)"
        [ "$freed_space" -gt 0 ] && print_status "Freed approximately ${freed_space}MB"
    else
        print_info "No old archives to clean"
    fi
    echo
}

# Generate rotation report
generate_report() {
    local report_file="$LOGS_DIR/rotation_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "═══════════════════════════════════════════════════════════════"
        echo "  GARBAKING POS - LOG ROTATION REPORT"
        echo "═══════════════════════════════════════════════════════════════"
        echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Mode: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE")"
        echo
        echo "Configuration:"
        echo "  Retention period: $RETENTION_DAYS days"
        echo "  Compression threshold: ${COMPRESSION_THRESHOLD_MB}MB"
        echo
        echo "Statistics:"
        echo "  Total log size: $(du -sh "$LOGS_DIR" | cut -f1)"
        echo "  Archived sessions: $(find "$ARCHIVE_DIR" -type d -name "20*" 2>/dev/null | wc -l)"
        echo "  Compressed archives: $(find "$COMPRESSED_DIR" -name "*.tar.gz" 2>/dev/null | wc -l)"
        echo
        echo "Storage breakdown:"
        echo "  Active logs: $(du -sh "$LOGS_DIR/latest" 2>/dev/null | cut -f1 || echo "N/A")"
        echo "  Archives: $(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1)"
        echo "  Compressed: $(du -sh "$COMPRESSED_DIR" 2>/dev/null | cut -f1)"
        echo
        echo "═══════════════════════════════════════════════════════════════"
    } > "$report_file"
    
    print_info "Report saved to: $report_file"
}

# Main execution
echo -e "${CYAN}Starting log rotation process...${NC}\n"

# Step 1: Rotate logs to archive
rotate_logs

# Step 2: Compress large archives
compress_archives

# Step 3: Cleanup old archives (if auto-cleanup enabled or forced)
if [ "$AUTO_CLEANUP" = true ] || [ "$FORCE" = true ]; then
    cleanup_old_archives
else
    print_info "Skipping cleanup (use --auto-cleanup or --force to enable)"
    echo
fi

# Generate report
if [ "$DRY_RUN" = false ]; then
    generate_report
fi

# Final summary
echo -e "${CYAN}Final Status:${NC}"
new_size=$(du -sh "$LOGS_DIR" 2>/dev/null | cut -f1)
echo "  Current log size: $new_size"
echo "  Archives: $(find "$ARCHIVE_DIR" -type d -name "20*" 2>/dev/null | wc -l) sessions"
echo "  Compressed: $(find "$COMPRESSED_DIR" -name "*.tar.gz" 2>/dev/null | wc -l) files"
echo

if [ "$DRY_RUN" = false ]; then
    print_status "Log rotation complete!"
else
    print_info "Dry run complete - no changes were made"
fi

echo
echo -e "${CYAN}Tips:${NC}"
echo "  • Run with --auto-cleanup to enable automatic deletion"
echo "  • Use --setup-cron to automate daily rotation"
echo "  • Compressed archives are in: $COMPRESSED_DIR"
echo "  • To extract: tar -xzf <archive>.tar.gz"
