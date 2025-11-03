# Garbaking POS - Startup Guide

## Quick Start

### Option 1: Automated Startup (Recommended)

```bash
./start-services.sh
```

This script will:
1. ✅ Check and setup the database automatically
2. ✅ Start the backend server
3. ✅ Start the Admin POS frontend
4. ✅ Start the Customer App frontend
5. ✅ Verify all services are running

### Option 2: Manual Startup

#### 1. Setup Database (First Time Only)

```bash
cd backend
npm install
npm run db:setup
```

#### 2. Start Backend

```bash
cd backend
npm run dev
```

#### 3. Start Admin POS

```bash
cd frontend/admin-pos
npm install  # First time only
npm run dev
```

#### 4. Start Customer App

```bash
cd frontend/customer-app
npm install  # First time only
npm run dev
```

## Stop All Services

```bash
./stop-services.sh
```

## Troubleshooting

### ❌ "Database not found" or "Database health check failed"

**Solution:**
```bash
cd backend
npm run db:setup
```

This will:
- Generate Prisma client
- Create database schema
- Seed initial data

### ❌ "Port already in use"

**Solution:**
```bash
# Kill all services
./stop-services.sh

# Or kill specific port
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Admin POS
lsof -ti:3002 | xargs kill -9  # Customer App
```

### ❌ Backend failing to start

**Check logs:**
```bash
tail -f logs/backend.log
```

**Common fixes:**
1. Database not initialized: `cd backend && npm run db:setup`
2. Dependencies not installed: `cd backend && npm install`
3. Port in use: `./stop-services.sh`

### ❌ Frontend not loading

**Check logs:**
```bash
tail -f logs/admin-pos.log
tail -f logs/customer-app.log
```

**Common fixes:**
1. Backend not running: Ensure backend is started first
2. Dependencies not installed: `npm install` in frontend directory
3. Port in use: Check if another app is using the port

## Service URLs

After successful startup:

- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Admin POS:** http://localhost:3000
- **Customer App:** http://localhost:3002

## Database Management

### Check Database Status

```bash
cd backend
npm run db:check
```

### Reset Database (⚠️ Deletes all data)

```bash
cd backend
npm run db:reset
```

### View Database in Browser

```bash
cd backend
npm run db:studio
```

## NPM Scripts Reference

### Backend Scripts

```bash
npm run dev          # Start backend (with DB check)
npm run dev:unsafe   # Start backend (skip DB check)
npm run db:check     # Verify database is valid
npm run db:setup     # Initialize/reset database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

### Frontend Scripts (Admin POS & Customer App)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Health Checks

### Backend Health Check

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": {
    "status": "connected"
  },
  "timestamp": "2025-10-26T...",
  "uptime": 123.45
}
```

### Database Health Check

```bash
cd backend
bash scripts/check-database.sh
```

## Development Workflow

### 1. First Time Setup

```bash
# Clone repository
git clone <repository-url>
cd GARBAKING_POS

# Install all dependencies
cd backend && npm install && cd ..
cd frontend/admin-pos && npm install && cd ../..
cd frontend/customer-app && npm install && cd ../..

# Start all services
./start-services.sh
```

### 2. Daily Development

```bash
# Start all services
./start-services.sh

# Make your changes...

# Stop all services
./stop-services.sh
```

### 3. After Pulling Changes

```bash
# Update dependencies
cd backend && npm install && cd ..
cd frontend/admin-pos && npm install && cd ../..
cd frontend/customer-app && npm install && cd ../..

# Update database if schema changed
cd backend && npm run db:push && cd ..

# Restart services
./stop-services.sh
./start-services.sh
```

## Common Issues

### Issue: "Cannot find module '@prisma/client'"

```bash
cd backend
npm run db:generate
```

### Issue: "Database locked"

Another process is using the database. Stop all services:
```bash
./stop-services.sh
```

### Issue: "EADDRINUSE: address already in use"

A service is already running on that port:
```bash
./stop-services.sh
./start-services.sh
```

### Issue: Frontend shows "Network Error"

Backend is not running or not accessible:
1. Check backend is running: `curl http://localhost:3001/health`
2. Check backend logs: `tail -f logs/backend.log`
3. Restart backend: `./stop-services.sh && ./start-services.sh`

## Production Deployment

### Build All Services

```bash
# Build backend
cd backend
npm run build

# Build Admin POS
cd ../frontend/admin-pos
npm run build

# Build Customer App
cd ../customer-app
npm run build
```

### Start in Production

```bash
# Backend
cd backend
npm start

# Serve frontend builds with nginx or similar
```

## Support

If you encounter issues not covered here:

1. Check the logs: `tail -f logs/*.log`
2. Verify database: `cd backend && npm run db:check`
3. Try fresh start: `./stop-services.sh && ./start-services.sh`
4. Reset database: `cd backend && npm run db:setup`

For persistent issues, contact the development team.
