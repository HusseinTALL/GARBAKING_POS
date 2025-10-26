# Garbaking POS - Management Scripts

This directory contains convenient bash scripts to manage all Garbaking POS applications.

## Available Scripts

### 🚀 `start-all.sh`
Start all services (Backend API, Admin POS, and Customer App) with a single command.

```bash
./start-all.sh
```

**What it does:**
- Cleans up any existing processes on ports 3000, 3001, and 3002
- Starts the Backend API server on port 3001
- Starts the Admin POS application on port 3000
- Starts the Customer App on port 3002
- Creates log files in the `logs/` directory
- Shows status of all services

**Output:**
- Backend API: `http://localhost:3001`
- Admin POS: `http://localhost:3000`
- Customer App: `http://localhost:3002`

---

### 🛑 `stop-all.sh`
Stop all running services gracefully.

```bash
./stop-all.sh
```

**What it does:**
- Stops processes using PID files
- Kills processes on ports 3000, 3001, and 3002
- Cleans up lingering node processes
- Verifies all ports are freed

---

### 🔄 `restart-all.sh`
Restart all services (stops then starts).

```bash
./restart-all.sh
```

**What it does:**
- Runs `stop-all.sh`
- Waits 3 seconds
- Runs `start-all.sh`

---

### 📊 `status.sh`
Check the status of all services.

```bash
./status.sh
```

**What it does:**
- Shows running/stopped status for each service
- Displays URLs and process IDs
- Shows summary count of running vs stopped services
- Lists quick commands for management

**Example output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Backend API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:  ● Running
URL:     http://localhost:3001
PID:     12345
Health:  http://localhost:3001/health
```

---

### 📝 `view-logs.sh`
Interactive log viewer for all services.

```bash
./view-logs.sh
```

**Features:**
- View individual service logs
- View all logs combined
- Follow logs in real-time (live tail)
- Interactive menu interface

**Menu options:**
1. Backend API logs
2. Admin POS logs
3. Customer App logs
4. All logs (combined)
5. Follow all logs (live tail)
q. Quit

---

## Log Files

All logs are stored in the `logs/` directory:

- `logs/backend.log` - Backend API server logs
- `logs/admin-pos.log` - Admin POS application logs
- `logs/customer-app.log` - Customer App logs
- `logs/backend.pid` - Backend process ID
- `logs/admin-pos.pid` - Admin POS process ID
- `logs/customer-app.pid` - Customer App process ID

---

## Quick Start Guide

### First Time Setup
1. Make sure all dependencies are installed:
   ```bash
   cd backend && npm install && cd ..
   cd frontend/admin-pos && npm install && cd ../..
   cd frontend/customer-app && npm install && cd ../..
   ```

2. Start all services:
   ```bash
   ./start-all.sh
   ```

3. Check status:
   ```bash
   ./status.sh
   ```

### Daily Usage

**Start everything:**
```bash
./start-all.sh
```

**Check what's running:**
```bash
./status.sh
```

**View logs:**
```bash
./view-logs.sh
```

**Restart after code changes:**
```bash
./restart-all.sh
```

**Stop everything at end of day:**
```bash
./stop-all.sh
```

---

## Troubleshooting

### Ports already in use
If you get "address already in use" errors:
```bash
./stop-all.sh
./start-all.sh
```

### Services not starting
1. Check the logs:
   ```bash
   ./view-logs.sh
   ```

2. Manually check what's on the ports:
   ```bash
   lsof -i:3000
   lsof -i:3001
   lsof -i:3002
   ```

3. Force kill if needed:
   ```bash
   lsof -ti:3000 | xargs kill -9
   lsof -ti:3001 | xargs kill -9
   lsof -ti:3002 | xargs kill -9
   ```

### View real-time logs
```bash
# Option 1: Use the interactive viewer
./view-logs.sh
# Then select option 5 for live tail

# Option 2: Manual tail
tail -f logs/*.log
```

---

## Environment Variables

The scripts use default ports and settings. To customize:

- Backend API: Port 3001 (configurable in `backend/.env`)
- Admin POS: Port 3000 (configurable in `frontend/admin-pos/vite.config.ts`)
- Customer App: Port 3002 (configurable in `frontend/customer-app/vite.config.ts`)

---

## Notes

- All scripts must be run from the project root directory
- Scripts use `lsof` and `kill` commands (standard on macOS/Linux)
- PID files help track which processes belong to which service
- Logs rotate automatically when services restart
- Scripts are color-coded for better readability

---

## Script Features

### Color Coding
- 🟢 Green: Success, running status
- 🔵 Blue: Informational messages, URLs
- 🟡 Yellow: Warnings, pending actions
- 🔴 Red: Errors, stopped status

### Error Handling
- Graceful shutdown of services
- Fallback to force kill if needed
- Port conflict resolution
- Log file creation and management

### Process Management
- PID file tracking
- Clean shutdown procedures
- Background process handling
- Port availability checks

---

## Support

For issues or questions:
1. Check the logs: `./view-logs.sh`
2. Check the status: `./status.sh`
3. Review the README.md in the project root
4. Check CLAUDE.md for development guidelines
