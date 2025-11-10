# 🥐 Garbaking POS - Enhanced Logging System

> **Transform your basic startup script into an enterprise-grade logging and monitoring platform in 30 seconds!**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Bash](https://img.shields.io/badge/bash-5.0+-orange.svg)](https://www.gnu.org/software/bash/)

## 🎯 What Is This?

An **all-in-one logging, monitoring, and analysis suite** for Spring Boot microservices that includes:

- 🔴 **Real-time Dashboard** - Monitor all services at a glance
- 📊 **Intelligent Analysis** - Automatic error detection and categorization
- 🔍 **Advanced Log Viewer** - Filter, search, and follow logs with ease
- ♻️ **Automated Rotation** - Smart log management with compression
- 📈 **Report Generation** - HTML/JSON reports for documentation
- ⚙️ **Zero Configuration** - Works out of the box

## ✨ Quick Look

### Before vs After

| Basic Script | Enhanced System |
|-------------|----------------|
| Simple log redirect | Organized timestamped sessions |
| Manual monitoring | Real-time dashboard |
| Grep for errors | Intelligent analysis |
| Manual cleanup | Automated rotation |
| No insights | Comprehensive reports |

### 30-Second Demo

```bash
# Install (one time)
./install.sh

# Start services
./start-backend-enhanced.sh

# Monitor in real-time
./dashboard.sh
```

That's it! You're now running an enterprise logging system.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
chmod +x install.sh
./install.sh
```

The installer will:
- ✅ Make all scripts executable
- ✅ Create directory structure
- ✅ Generate helper scripts
- ✅ Create configuration file
- ✅ Show quick start guide

### Option 2: Manual Setup

```bash
# Make scripts executable
chmod +x *.sh

# Create directories
mkdir -p logs/archive/compressed logs/reports

# Start using
./start-backend-enhanced.sh
```

## 📦 What's Included

### Core Scripts

| Script | Purpose | Size |
|--------|---------|------|
| `start-backend-enhanced.sh` | Enhanced service startup with advanced logging | 17KB |
| `dashboard.sh` | Real-time monitoring dashboard ⭐ | 16KB |
| `view-logs.sh` | Interactive log viewer with filtering | 13KB |
| `analyze-logs.sh` | Intelligent log analysis & reporting | 20KB |
| `rotate-logs.sh` | Automated log rotation & cleanup | 13KB |
| `install.sh` | One-command setup installer | 11KB |

### Documentation

| Document | Description | Size |
|----------|-------------|------|
| `README.md` | This file - Overview and quick start | 12KB |
| `QUICK_START.md` | Concise guide with common tasks | 8KB |
| `LOGGING_README.md` | Comprehensive documentation | 16KB |
| `IMPROVEMENTS.md` | What's new and feature comparison | 14KB |

### Generated Scripts

The installer creates these helper scripts:
- `status-check.sh` - Quick service status check
- `stop-services.sh` - Gracefully stop all services

## 🎓 Usage Examples

### 1. Daily Monitoring

```bash
# Start services
./start-backend-enhanced.sh

# Open dashboard (auto-refreshes every 2 seconds)
./dashboard.sh

# Dashboard keyboard shortcuts:
# 'q' - Quit
# 'e' - View errors
# 'l' - Open log viewer
# 'a' - Run analysis
# '?' - Help
```

### 2. Troubleshooting

```bash
# Find recent errors
./view-logs.sh --since 1h --errors

# Analyze specific service
./analyze-logs.sh --service order-service

# Follow logs in real-time
./view-logs.sh --follow api-gateway

# Generate diagnostic report
./analyze-logs.sh --export --format html
```

### 3. Log Management

```bash
# Preview what will be cleaned
./rotate-logs.sh --dry-run

# Clean logs older than 7 days
./rotate-logs.sh --retention 7 --auto-cleanup

# Setup automated daily rotation
./rotate-logs.sh --setup-cron
```

### 4. Advanced Filtering

```bash
# Search for exceptions
./view-logs.sh --search "NullPointerException" --all

# Errors in specific time range
./view-logs.sh --between "14:00:00" "15:00:00" --errors

# Statistics overview
./view-logs.sh --stats
```

## 📊 Features Highlight

### Real-Time Dashboard 🔴

<img src="docs/dashboard-preview.png" alt="Dashboard Preview" width="600" />

The dashboard shows:
- ✅ Service status with color coding (🟢 Healthy | 🟡 Warning | 🔴 Errors)
- ⏱️ Uptime for each service
- 📊 CPU & memory usage
- ⚠️ Recent error counts
- 📜 Live activity stream

### Intelligent Log Analysis 🧠

```
Service: order-service
─────────────────────────────────────
✗ Total errors: 15
  ⚠ ERROR THRESHOLD EXCEEDED
  
Error Breakdown:
  • NullPointerException: 8
  • Timeout errors: 5
  • Connection errors: 2

Most Common Errors:
  [8] Could not initialize proxy - no Session
  [5] Read timeout after 3000ms
  
Performance Metrics:
  Startup time: 12.5s
  Avg response time: 145ms
  
Health Score: 65% - FAIR
```

### Smart Log Organization 📁

```
logs/
├── latest/ → 20241109_143022/    # Symlink to current session
├── 20241109_143022/               # Timestamped session
│   ├── config-server.log          # Individual service logs
│   ├── user-service.log
│   ├── order-service.log
│   ├── aggregated.log             # All services combined
│   └── session_summary.txt        # Summary on shutdown
├── archive/                       # Old sessions
│   ├── 20241108_120000/
│   └── compressed/
│       └── 20241101_100000.tar.gz
└── reports/                       # Generated reports
    ├── analysis_20241109.html
    └── analysis_20241109.json
```

## 🎯 Key Features

### 1. Organized Logging
- ✅ Timestamped log sessions
- ✅ Individual + aggregated logs
- ✅ Never lose historical data
- ✅ Easy session comparison

### 2. Real-Time Monitoring
- ✅ Live service dashboard
- ✅ Automatic health checks
- ✅ Error detection
- ✅ Performance metrics

### 3. Intelligent Analysis
- ✅ Automatic error categorization
- ✅ Performance analysis
- ✅ Security issue detection
- ✅ Health scoring

### 4. Advanced Filtering
- ✅ Time-based (`--since 1h`)
- ✅ Level-based (`--errors`, `--warnings`)
- ✅ Pattern search (`--search "pattern"`)
- ✅ Service-specific

### 5. Report Generation
- ✅ HTML reports with styling
- ✅ JSON for CI/CD integration
- ✅ Text for quick viewing
- ✅ Statistical summaries

### 6. Automated Management
- ✅ Smart log rotation
- ✅ Compression (10MB+ files)
- ✅ Configurable retention (default 30 days)
- ✅ Cron job setup

## 📚 Documentation

### For Quick Learners
Start with **[QUICK_START.md](QUICK_START.md)** - Get up and running in 5 minutes with:
- 30-second start guide
- Common tasks & examples
- Cheat sheet
- Pro tips

### For Deep Divers
Read **[LOGGING_README.md](LOGGING_README.md)** - Comprehensive guide covering:
- Complete feature reference
- Script documentation
- Advanced usage patterns
- Best practices
- Troubleshooting
- CI/CD integration

### For Feature Explorers
Check **[IMPROVEMENTS.md](IMPROVEMENTS.md)** - See what's new:
- Feature comparison
- Technical improvements
- Use case examples
- Time savings analysis

## 🔧 Configuration

Edit `logging-config.env` to customize:

```bash
# Health monitoring
HEALTH_CHECK_INTERVAL=30        # Seconds between checks

# Log rotation
LOG_RETENTION_DAYS=30           # Days to keep logs
COMPRESSION_THRESHOLD_MB=10      # Compress if larger
AUTO_CLEANUP=false              # Automatic cleanup

# Dashboard
DASHBOARD_REFRESH_INTERVAL=2    # Refresh rate

# Thresholds
ERROR_THRESHOLD=10              # Error alert threshold
WARN_THRESHOLD=50               # Warning threshold
```

## 🎨 Color Coding

The system uses intuitive color coding:

| Color | Meaning | Used For |
|-------|---------|----------|
| 🟢 Green | Success/Healthy | Service status, info logs |
| 🟡 Yellow | Warning/Caution | Warnings, minor issues |
| 🔴 Red | Error/Critical | Errors, exceptions, failures |
| 🔵 Blue | Information | System messages |
| ⚫ Gray | Inactive/Neutral | Stopped services, debug |

## 💡 Pro Tips

### Dashboard Tricks
- Press `e` to instantly jump to error logs
- Press `l` for detailed log inspection
- Press `a` to run comprehensive analysis
- Dashboard auto-refreshes - no manual refresh needed!

### Log Viewer Tricks
```bash
# Combine filters for powerful queries
./view-logs.sh --since 1h --errors --search "timeout"

# Use --stats for quick health overview
./view-logs.sh --stats

# Follow multiple services via aggregated log
./view-logs.sh --follow --all
```

### Analysis Tricks
```bash
# Quick health check
./analyze-logs.sh --health

# Generate report for the team
./analyze-logs.sh --full --export --format html

# Security audit
./analyze-logs.sh --security
```

### Automation
```bash
# Setup once, forget about log cleanup
./rotate-logs.sh --setup-cron

# Create custom monitoring (example)
cat > monitor.sh << 'EOF'
#!/bin/bash
ERRORS=$(./view-logs.sh --since 1h --errors --all | wc -l)
[ "$ERRORS" -gt 100 ] && echo "Alert: $ERRORS errors!" | mail -s "High Error Rate" admin@example.com
EOF
chmod +x monitor.sh
(crontab -l; echo "*/30 * * * * /path/to/monitor.sh") | crontab -
```

## 🆘 Troubleshooting

### Services won't start
```bash
# Check if ports are available
lsof -i :8080

# Stop existing processes
./stop-services.sh
```

### Can't see logs
```bash
# Verify services are running
./dashboard.sh

# Or quick status check
./status-check.sh
```

### Logs growing too large
```bash
# Immediate cleanup
./rotate-logs.sh --retention 7 --auto-cleanup

# Setup automation
./rotate-logs.sh --setup-cron
```

### Need help?
```bash
# Each script has detailed help
./dashboard.sh --help
./view-logs.sh --help
./analyze-logs.sh --help
./rotate-logs.sh --help

# Or press '?' in dashboard
```

## 📈 Performance & Resource Usage

### Disk Space
- Active session: ~50-200MB per day
- Compressed archives: ~5-20MB per session
- With rotation: Automatically managed

### Memory Usage
- Dashboard: <10MB
- Log viewers: <20MB
- Analysis: <50MB (temporary)

### CPU Impact
- Health monitoring: <1% CPU
- Dashboard refresh: Negligible
- Log analysis: <5% CPU (temporary)

## 🔒 Security Considerations

The system includes security analysis that detects:
- Authentication failures
- SQL injection attempts
- Suspicious activity patterns
- Rate limit violations
- Access control issues

Run regular security audits:
```bash
./analyze-logs.sh --security
```

## 🚦 System Requirements

**Minimum:**
- Bash 4.0+
- Standard GNU utilities (grep, awk, sed)
- 100MB free disk space

**Recommended:**
- Bash 5.0+
- curl (for health checks)
- 1GB free disk space

**Optional:**
- Docker (for MySQL/Kafka)
- cron (for automation)
- mail (for alerts)

## 🤝 Contributing

Want to improve the system?

1. Add new analysis patterns
2. Enhance dashboard features
3. Create new export formats
4. Improve documentation
5. Share your use cases

## 📄 License

MIT License - See LICENSE file for details

## 🌟 Credits

Built with ❤️ for better DevOps practices

**From a basic startup script to enterprise observability!**

## 📞 Support & Resources

- **Quick Help:** Run any script with `--help`
- **Quick Start:** [QUICK_START.md](QUICK_START.md)
- **Full Docs:** [LOGGING_README.md](LOGGING_README.md)
- **What's New:** [IMPROVEMENTS.md](IMPROVEMENTS.md)
- **Dashboard Help:** Press `?` while in dashboard

## 🎉 Get Started Now!

```bash
# One command to rule them all
./install.sh

# Then start your journey
./start-backend-enhanced.sh
./dashboard.sh
```

**Welcome to professional logging! 🎊**

---

<div align="center">

### ⭐ Star this project if it helps you! ⭐

**Version 2.0.0** | Last Updated: November 2024

*"From basic scripts to enterprise observability"*

[Quick Start](QUICK_START.md) | [Full Documentation](LOGGING_README.md) | [What's New](IMPROVEMENTS.md)

</div>
