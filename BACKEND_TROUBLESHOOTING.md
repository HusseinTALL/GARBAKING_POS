# Backend Connection Troubleshooting Guide

## 🚨 Issue: Backend Not Responding

If you see "Backend Disconnected" messages or connection errors, follow these steps:

---

## ✅ Quick Fix (Recommended)

### Option 1: Start Everything Together
```bash
# From project root
./start-all.sh
```
This starts:
- Backend API (port 3001)
- Admin POS (port 3000)
- Customer App (port 3002)
- Kitchen Display (port 3003)

### Option 2: Start Backend Only
```bash
# From project root
./start-backend.sh
```

---

## 🔍 Manual Troubleshooting

### Step 1: Check If Backend Is Running

```bash
# Check if process is running
ps aux | grep "node.*backend" | grep -v grep

# Check if port 3001 is in use
lsof -i :3001
```

**If nothing is returned:** Backend is not running → Go to Step 2

**If something is returned:** Backend is running but not responding → Go to Step 3

---

### Step 2: Start the Backend Manually

```bash
cd backend

# 1. Ensure .env file exists
cp .env.example .env  # Only if .env doesn't exist

# 2. Install dependencies (if needed)
npm install

# 3. Initialize database (if needed)
npx prisma generate
npx prisma db push --accept-data-loss

# 4. Create upload directories
mkdir -p public/uploads/menu
mkdir -p public/uploads/categories

# 5. Start the backend
npm run dev
```

**Wait 5-10 seconds**, then test:
```bash
curl http://localhost:3001/health
```

**Expected output:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T...",
  "uptime": 10.5,
  "environment": "development"
}
```

---

### Step 3: Backend Running But Not Responding

This usually means the backend crashed or is stuck.

```bash
# Kill the backend process
kill -9 $(lsof -t -i:3001)

# Wait 2 seconds
sleep 2

# Restart it
cd backend
npm run dev
```

---

### Step 4: Port Conflicts

If you get "Port 3001 is already in use":

```bash
# Find what's using port 3001
lsof -i :3001

# Kill it
kill -9 $(lsof -t -i:3001)

# Start backend again
cd backend
npm run dev
```

---

## 🐛 Common Errors & Solutions

### Error: "Database not found"

```bash
cd backend
npx prisma generate
npx prisma db push --accept-data-loss
```

### Error: ".env file not found"

```bash
cd backend
cp .env.example .env
```

### Error: "Cannot find module"

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Permission denied" on scripts

```bash
# From project root
chmod +x start-backend.sh
chmod +x start-all.sh
```

### Error: "EADDRINUSE: Port 3001 already in use"

```bash
# Kill all processes on port 3001
lsof -ti:3001 | xargs kill -9

# Wait 2 seconds then restart
sleep 2
cd backend && npm run dev
```

---

## 📊 Health Check Endpoints

### Main Health Check
```bash
curl http://localhost:3001/health
```

### API Health Check
```bash
curl http://localhost:3001/api/health
```

### Test Specific Endpoints

**Menu Items:**
```bash
curl http://localhost:3001/api/menu/items
```

**Categories:**
```bash
curl http://localhost:3001/api/menu/categories
```

**Auth (should return 401 if not authenticated):**
```bash
curl http://localhost:3001/api/auth/me
```

---

## 🔄 Auto-Recovery System

The frontend now includes automatic backend health monitoring:

### Features:
- ✅ Checks backend health every 30 seconds
- ✅ Auto-retries on failure with exponential backoff
- ✅ Shows visual indicator when disconnected
- ✅ Automatically reconnects when backend comes back online
- ✅ Displays retry attempts and progress

### Status Indicator:
- **Red Alert**: Backend is down
  - Shows error message
  - Displays retry counter
  - Provides quick action buttons
- **Green Toast**: Backend reconnected
  - Shows connection restored message
  - Displays response time

---

## 📝 Logs

### Backend Logs
If using `start-all.sh`:
```bash
tail -f logs/backend.log
```

If running manually:
- Logs are output directly to terminal

### Check for Errors:
```bash
# In backend logs
grep -i error logs/backend.log

# Or in real-time
tail -f logs/backend.log | grep -i error
```

---

## 🆘 Still Having Issues?

### Full Reset (Nuclear Option)

```bash
# From project root

# 1. Kill all processes
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
lsof -ti:3002 | xargs kill -9
lsof -ti:3003 | xargs kill -9

# 2. Clean backend
cd backend
rm -rf node_modules package-lock.json
npm install

# 3. Reset database
rm -f prisma/dev.db*
npx prisma generate
npx prisma db push --accept-data-loss

# 4. Recreate uploads
mkdir -p public/uploads/menu public/uploads/categories

# 5. Start everything
cd ..
./start-all.sh
```

---

## 📞 Support Checklist

If you need to report an issue, provide:

1. **Error Message:**
   ```bash
   # Get full error
   cat logs/backend.log | tail -50
   ```

2. **System Info:**
   ```bash
   node --version
   npm --version
   ```

3. **Port Status:**
   ```bash
   lsof -i :3001
   ```

4. **Process Status:**
   ```bash
   ps aux | grep node
   ```

5. **Recent Logs:**
   ```bash
   tail -100 logs/backend.log
   ```

---

## 🎯 Prevention Tips

### Always Use Startup Scripts
✅ **DO:** `./start-all.sh` or `./start-backend.sh`
❌ **DON'T:** Manually start services in different terminals

### Monitor Health
- Check the status indicator in the admin UI
- Visit http://localhost:3001/health regularly

### Keep Logs
- Logs are saved in `logs/` directory
- Check logs when issues occur

### Clean Shutdown
- Use Ctrl+C to stop services gracefully
- Don't force-kill unless necessary

---

## 🔗 Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:3001 | Main API server |
| Health Check | http://localhost:3001/health | Backend status |
| Admin POS | http://localhost:3000 | POS interface |
| Customer App | http://localhost:3002 | Customer ordering |
| Kitchen Display | http://localhost:3003 | Kitchen orders |

---

## 🆕 New Features (Auto-Recovery)

The system now includes:

1. **Health Check Service** (`healthCheckService.ts`)
   - Monitors backend every 30 seconds
   - Auto-retries with exponential backoff
   - Max 10 retry attempts

2. **Visual Status Indicator** (`BackendStatusIndicator.vue`)
   - Shows when backend is down
   - Displays retry progress
   - Quick action buttons
   - Auto-dismisses when reconnected

3. **Startup Scripts**
   - `start-backend.sh` - Backend only
   - `start-all.sh` - Full stack
   - Handles errors automatically
   - Kills conflicting processes

You should **never** encounter prolonged connection issues again!
