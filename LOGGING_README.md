# 🥐 Garbaking POS - Enhanced Logging System

Advanced logging, monitoring, and analysis suite for Spring Boot microservices.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Scripts Reference](#scripts-reference)
- [Log Structure](#log-structure)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The enhanced logging system provides production-grade logging capabilities including:
- **Organized log directory structure** with timestamped sessions
- **Real-time monitoring** and health checks
- **Intelligent log analysis** with error detection
- **Automated log rotation** and compression
- **Interactive log viewing** with filtering
- **Aggregated logging** across all services
- **Export capabilities** (HTML, JSON, text)

## ✨ Features

### 1. Enhanced Startup Script
- Timestamped log sessions for each startup
- Individual service logs + aggregated log
- Graceful shutdown handling
- Service health monitoring
- Automatic error detection
- Session summaries

### 2. Interactive Log Viewer
- Real-time log following
- Color-coded output by log level
- Pattern searching and filtering
- Service-specific or aggregated views
- Statistical analysis

### 3. Intelligent Log Analyzer
- Automatic error detection and categorization
- Performance metrics analysis
- Security issue detection
- Service health checks
- Report generation (text, HTML, JSON)

### 4. Log Rotation & Cleanup
- Automated log archival
- Compression of old logs
- Configurable retention policies
- Cron job setup for automation

## 🚀 Quick Start

### 1. Make Scripts Executable

```bash
chmod +x start-backend-enhanced.sh
chmod +x view-logs.sh
chmod +x analyze-logs.sh
chmod +x rotate-logs.sh
```

### 2. Start Backend Services

```bash
# Start services (default mode)
./start-backend-enhanced.sh

# Start and follow logs
./start-backend-enhanced.sh --follow

# Start without health monitoring
./start-backend-enhanced.sh --no-monitor
```

### 3. View Logs

```bash
# Interactive mode (recommended for beginners)
./view-logs.sh

# Follow specific service logs
./view-logs.sh --follow api-gateway

# Show only errors
./view-logs.sh --errors user-service

# Search for pattern
./view-logs.sh --search "NullPointerException"

# View aggregated logs
./view-logs.sh --all

# Show statistics
./view-logs.sh --stats
```

### 4. Analyze Logs

```bash
# Full analysis
./analyze-logs.sh

# Analyze specific service
./analyze-logs.sh --service order-service

# Only error analysis
./analyze-logs.sh --errors

# Generate HTML report
./analyze-logs.sh --export --format html

# Check service health
./analyze-logs.sh --health
```

### 5. Rotate Logs

```bash
# Preview rotation (dry run)
./rotate-logs.sh --dry-run

# Rotate with auto cleanup
./rotate-logs.sh --auto-cleanup

# Setup automated daily rotation
./rotate-logs.sh --setup-cron

# Custom retention period
./rotate-logs.sh --retention 7 --auto-cleanup
```

## 📚 Scripts Reference

### start-backend-enhanced.sh

Enhanced startup script with advanced logging capabilities.

**Options:**
```bash
-f, --follow       Follow aggregated logs after startup
--no-monitor       Disable background health monitoring
-h, --help         Show help message
```

**Features:**
- Timestamped log sessions in `logs/YYYYMMDD_HHMMSS/`
- Individual service logs + aggregated log
- Automatic health monitoring every 30 seconds
- Graceful shutdown with session summary
- Error detection and warnings
- PID files for each service
- Symlink to latest logs at `logs/latest/`

**Generated Files:**
```
logs/
├── latest/ -> 20241109_143022/  (symlink)
├── 20241109_143022/
│   ├── config-server.log
│   ├── config-server.pid
│   ├── discovery-server.log
│   ├── discovery-server.pid
│   ├── user-service.log
│   ├── user-service.pid
│   ├── ... (all services)
│   ├── aggregated.log
│   ├── build.log
│   └── session_summary.txt
└── archive/
```

### view-logs.sh

Interactive log viewer with filtering and search capabilities.

**Usage Examples:**
```bash
# Interactive menu
./view-logs.sh

# Follow specific service
./view-logs.sh --follow order-service

# Filter by log level
./view-logs.sh --level ERROR api-gateway
./view-logs.sh --errors user-service
./view-logs.sh --warnings inventory-service

# Search for patterns
./view-logs.sh --search "ConnectionException"
./view-logs.sh -s "timeout" --all

# Time-based filtering
./view-logs.sh --since 1h user-service      # Last hour
./view-logs.sh --since 30m api-gateway      # Last 30 minutes
./view-logs.sh --since 2d --all             # Last 2 days

# Show specific number of lines
./view-logs.sh --lines 100 order-service
./view-logs.sh -n 200 --all

# Statistics
./view-logs.sh --stats
```

**Color Coding:**
- 🔴 RED: Errors, Exceptions
- 🟡 YELLOW: Warnings
- 🟢 GREEN: Info messages
- 🟣 MAGENTA: Debug messages

### analyze-logs.sh

Intelligent log analyzer with error detection and reporting.

**Analysis Types:**
```bash
--full              # Complete analysis (default)
--errors            # Error analysis only
--performance       # Performance metrics
--security          # Security issues
--health            # Service health check
```

**Options:**
```bash
--service NAME      # Analyze specific service
--export            # Generate report file
--format FORMAT     # Output format: text, html, json
```

**Example Usage:**
```bash
# Full analysis of all services
./analyze-logs.sh

# Error analysis for API Gateway
./analyze-logs.sh --errors --service api-gateway

# Performance analysis with HTML report
./analyze-logs.sh --performance --export --format html

# Security audit
./analyze-logs.sh --security

# Health check only
./analyze-logs.sh --health
```

**Generated Reports:**
```
logs/reports/
├── analysis_20241109_143022.html
├── analysis_20241109_143022.json
└── analysis_20241109_143022.txt
```

**Analysis Includes:**
- Error categorization (NullPointer, Timeout, Connection, SQL)
- Most common error patterns
- Performance metrics (startup time, response times)
- Security issues (auth failures, SQL injection attempts)
- Service health status
- Overall health score

### rotate-logs.sh

Automated log rotation, compression, and cleanup.

**Options:**
```bash
--retention DAYS            # Days to keep logs (default: 30)
--compress-threshold MB     # Compress logs larger than MB (default: 10)
--auto-cleanup              # Auto delete old logs
--dry-run                   # Preview without changes
--force                     # Force cleanup without confirmation
--setup-cron                # Setup automated daily rotation
```

**Usage Examples:**
```bash
# Preview rotation (safe)
./rotate-logs.sh --dry-run

# Rotate with default settings
./rotate-logs.sh

# Keep only 7 days of logs
./rotate-logs.sh --retention 7 --auto-cleanup

# Setup automated nightly rotation
./rotate-logs.sh --setup-cron

# Custom compression threshold
./rotate-logs.sh --compress-threshold 5 --auto-cleanup
```

**What it does:**
1. Moves old log sessions to archive/
2. Compresses archives larger than threshold
3. Deletes archives older than retention period
4. Generates rotation report

## 📁 Log Structure

### Directory Layout
```
project-root/
├── start-backend-enhanced.sh
├── view-logs.sh
├── analyze-logs.sh
├── rotate-logs.sh
└── logs/
    ├── latest -> 20241109_143022/   # Symlink to current session
    ├── 20241109_143022/             # Current session
    │   ├── *.log                    # Service logs
    │   ├── *.pid                    # Process IDs
    │   ├── aggregated.log           # All services combined
    │   ├── build.log                # Gradle build output
    │   └── session_summary.txt      # Session summary
    ├── archive/                     # Old sessions
    │   ├── 20241108_120000/
    │   ├── 20241107_093000/
    │   └── compressed/
    │       ├── 20241101_100000.tar.gz
    │       └── 20241031_120000.tar.gz
    └── reports/                     # Analysis reports
        ├── analysis_20241109_143022.html
        └── analysis_20241109_143022.json
```

### Log File Format

Each service log contains:
```
═══════════════════════════════════════════════════════
Service: user-service
Started: 2024-11-09 14:30:22
Port: 8081
PID: 12345
═══════════════════════════════════════════════════════

[timestamp] [service] Log message...
[timestamp] [service] Another log message...
```

### Aggregated Log Format
```
[2024-11-09 14:30:22] [config-server] Started with PID 12340
[2024-11-09 14:30:30] [discovery-server] Started with PID 12341
[2024-11-09 14:30:38] [user-service] Started with PID 12342
...
```

## 🎓 Advanced Usage

### 1. Monitoring Service Health

```bash
# Check service status
./status-check.sh

# Continuous health monitoring (built into enhanced startup)
./start-backend-enhanced.sh  # Monitors every 30 seconds

# Manual health check via logs
./analyze-logs.sh --health
```

### 2. Debugging Issues

```bash
# Find all errors in last hour
./view-logs.sh --since 1h --errors --all

# Search for specific exception
./view-logs.sh --search "NullPointerException" --all

# Analyze performance issues
./analyze-logs.sh --performance --service api-gateway

# View recent errors in real-time
./view-logs.sh --follow --errors --all
```

### 3. Creating Reports

```bash
# Generate comprehensive HTML report
./analyze-logs.sh --full --export --format html

# JSON report for integration
./analyze-logs.sh --full --export --format json

# Service-specific report
./analyze-logs.sh --service order-service --export --format html
```

### 4. Log Management Workflows

**Daily Monitoring Workflow:**
```bash
# 1. Check overnight errors
./view-logs.sh --stats

# 2. Analyze critical issues
./analyze-logs.sh --errors

# 3. View problematic services
./view-logs.sh --errors --all | grep -A 5 "ERROR"
```

**Weekly Maintenance Workflow:**
```bash
# 1. Generate weekly report
./analyze-logs.sh --full --export --format html

# 2. Rotate and compress old logs
./rotate-logs.sh --retention 30 --auto-cleanup

# 3. Check disk usage
du -sh logs/
```

### 5. Automated Monitoring Setup

```bash
# Setup automated log rotation (runs daily at 2 AM)
./rotate-logs.sh --setup-cron

# Add error alerting (cron example)
cat > check-errors.sh << 'EOF'
#!/bin/bash
ERRORS=$(./view-logs.sh --since 1h --errors --all | wc -l)
if [ "$ERRORS" -gt 100 ]; then
    echo "High error rate detected: $ERRORS errors in last hour" | mail -s "Alert: High Error Rate" admin@example.com
fi
EOF
chmod +x check-errors.sh
(crontab -l; echo "*/30 * * * * /path/to/check-errors.sh") | crontab -
```

## 💡 Best Practices

### 1. Log Retention Strategy

**Development:**
- Retention: 7 days
- Compression: 5MB threshold
- Auto-cleanup: Enabled

**Staging:**
- Retention: 14 days
- Compression: 10MB threshold
- Auto-cleanup: Enabled

**Production:**
- Retention: 30-90 days
- Compression: 20MB threshold
- Auto-cleanup: Manual review
- Offsite backup: Recommended

### 2. Monitoring Best Practices

✅ **DO:**
- Review logs daily using `./view-logs.sh --stats`
- Set up automated rotation with `--setup-cron`
- Generate weekly reports for trends
- Monitor disk usage regularly
- Keep compressed archives for compliance

❌ **DON'T:**
- Delete logs without backing up
- Ignore warning thresholds
- Let logs grow unbounded
- Skip regular analysis
- Disable health monitoring in production

### 3. Performance Tips

```bash
# Use specific services instead of --all for faster results
./view-logs.sh --follow order-service  # Fast
./view-logs.sh --follow --all          # Slower

# Limit lines for quick checks
./view-logs.sh --lines 50 user-service

# Use --since for time-bounded analysis
./analyze-logs.sh --since 1h --errors
```

### 4. Security Considerations

```bash
# Regular security audits
./analyze-logs.sh --security

# Monitor authentication failures
./view-logs.sh --search "authentication.*failed" --all

# Check for suspicious patterns
./view-logs.sh --search "SQL.*injection\|drop.*table" --all
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "No active log session found"

**Cause:** Services not started or logs directory missing

**Solution:**
```bash
# Start services first
./start-backend-enhanced.sh

# Check if logs exist
ls -la logs/latest
```

#### 2. "Permission denied"

**Cause:** Scripts not executable

**Solution:**
```bash
chmod +x *.sh
```

#### 3. Logs growing too large

**Cause:** No rotation configured

**Solution:**
```bash
# Manual rotation
./rotate-logs.sh --auto-cleanup

# Setup automation
./rotate-logs.sh --setup-cron
```

#### 4. High memory usage in log viewer

**Cause:** Following too many logs simultaneously

**Solution:**
```bash
# View specific service instead of --all
./view-logs.sh --follow api-gateway

# Limit lines
./view-logs.sh --follow --lines 100 api-gateway
```

### Debug Mode

Enable debug output by setting:
```bash
set -x  # At the top of any script
```

### Getting Help

```bash
# Show help for any script
./start-backend-enhanced.sh --help
./view-logs.sh --help
./analyze-logs.sh --help
./rotate-logs.sh --help
```

## 📊 Log Analysis Examples

### Example 1: Finding Memory Leaks

```bash
# Search for memory-related messages
./view-logs.sh --search "OutOfMemory\|heap\|memory" --all

# Analyze performance over time
./analyze-logs.sh --performance --service user-service
```

### Example 2: Database Connection Issues

```bash
# Find connection errors
./view-logs.sh --search "SQLException\|connection" --errors

# Analyze specific service
./analyze-logs.sh --errors --service order-service
```

### Example 3: API Performance Monitoring

```bash
# Check response times
./view-logs.sh --search "response.*time\|duration" api-gateway

# Performance analysis
./analyze-logs.sh --performance --service api-gateway
```

## 🎯 Integration with CI/CD

### GitHub Actions Example

```yaml
name: Log Analysis

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  analyze-logs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Analyze Logs
        run: |
          ./analyze-logs.sh --full --export --format json
          
      - name: Upload Reports
        uses: actions/upload-artifact@v2
        with:
          name: log-analysis
          path: logs/reports/*.json
```

## 📝 Customization

### Modify Health Check Interval

Edit `start-backend-enhanced.sh`:
```bash
HEALTH_CHECK_INTERVAL=30  # Change to desired seconds
```

### Adjust Error Thresholds

Edit `analyze-logs.sh`:
```bash
ERROR_THRESHOLD=10
WARN_THRESHOLD=50
```

### Custom Log Patterns

Add to `view-logs.sh` colorization:
```bash
colorize_log() {
    # Add your custom patterns
    if echo "$line" | grep -q "CUSTOM_PATTERN"; then
        echo -e "${CUSTOM_COLOR}$line${NC}"
    fi
}
```

## 🤝 Contributing

To add new features:
1. Follow existing script structure
2. Add appropriate help text
3. Update this README
4. Test in dry-run mode first

## 📜 License

MIT License - See project root for details

---

**Need Help?** Run any script with `--help` flag or check the logs/latest directory.

**Version:** 2.0.0  
**Last Updated:** November 2024
