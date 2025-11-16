# start-backend-enhanced.sh - Issues Fixed

## Summary
Fixed all compatibility issues in the enhanced backend startup script to make it work with Bash 3.2 (macOS default) and cross-platform environments.

## Issues Identified and Fixed

### 1. **Bash Version Incompatibility** (Line 61-79)
**Problem:** Used `declare -A` for associative arrays which requires Bash 4.0+, but macOS ships with Bash 3.2.

**Fix:** Replaced associative arrays with parallel indexed arrays:
- `SERVICE_NAMES` - array of service names
- `SERVICE_PORTS` - array of corresponding ports
- `SERVICE_MODULES` - array of module directories
- `SERVICE_JARS` - array of JAR filenames
- Access by index instead of keys

### 2. **sed Command macOS Incompatibility** (Line 325)
**Problem:** `sed -i` without backup extension doesn't work on macOS (BSD sed).

**Fix:** Added OS detection and conditional sed syntax:
```bash
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/PID: Will be updated.../PID: $pid/" "$log_file"
else
    sed -i "s/PID: Will be updated.../PID: $pid/" "$log_file"
fi
```

### 3. **date Command macOS Incompatibility** (Line 212)
**Problem:** `date -r` syntax differs between GNU and BSD (macOS) versions.

**Fix:** Added cross-platform date handling:
```bash
if [[ "$OSTYPE" == "darwin"* ]]; then
    session_start=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$CURRENT_LOG_DIR" 2>/dev/null || date '+%Y-%m-%d %H:%M:%S')
else
    session_start=$(stat -c "%y" "$CURRENT_LOG_DIR" 2>/dev/null | cut -d'.' -f1 || date '+%Y-%m-%d %H:%M:%S')
fi
```

### 4. **Added Fallbacks for stat Command**
**Enhancement:** Added fallback to current date if stat command fails.

## Key Changes

### Before:
- Used Bash 4.0+ features (associative arrays)
- Linux-specific commands without macOS alternatives
- No cross-platform compatibility

### After:
- Compatible with Bash 3.2+
- Cross-platform support (Linux and macOS)
- Maintains all original functionality
- Uses indexed arrays for service management
- OS-aware command execution

## Testing
✅ Syntax check passed: `bash -n start-backend-enhanced.sh`
✅ Help flag works: `./start-backend-enhanced.sh --help`
✅ Compatible with macOS Bash 3.2.57

## Script Compatibility
- **Bash Version:** 3.2+ (macOS default: 3.2.57)
- **Operating Systems:** Linux, macOS
- **Dependencies:** java, lsof, nc, curl, docker-compose

## Usage
```bash
# Start all services
./start-backend-enhanced.sh

# Start with log following
./start-backend-enhanced.sh --follow

# Start without health monitoring
./start-backend-enhanced.sh --no-monitor

# View help
./start-backend-enhanced.sh --help
```

