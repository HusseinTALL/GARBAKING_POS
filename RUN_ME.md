# 🚀 HOW TO START GARBAKING POS

## ⚠️ IMPORTANT: Use the Correct Backend!

This project has TWO backend directories:
- `backend/` ✅ **USE THIS** - Node.js/Fastify/Prisma (The one we're using)
- `garbaking-backend/` ❌ **IGNORE THIS** - Old Spring Boot attempt

---

## 🎯 Quick Start (Recommended)

### Start Everything:
```bash
# From project root directory
./start-all.sh
```

This starts:
- ✅ Backend API (http://localhost:3001)
- ✅ Admin POS (http://localhost:3000)
- ✅ Customer App (http://localhost:3002)
- ✅ Kitchen Display (http://localhost:3003)

### Start Backend Only:
```bash
./start-backend.sh
```

---

## 🔴 DO NOT Use Docker Compose

The `docker-compose.yml` file is for the **OLD** Spring Boot backend in `garbaking-backend/`.

**It will NOT work** with our current Node.js backend.

If you need Docker, we'll need to create a new docker-compose for the Node.js stack.

---

## ✅ What to Do Now

1. **Kill any running Docker containers:**
   ```bash
   docker-compose down
   ```

2. **Navigate to project root:**
   ```bash
   cd "/Users/mac/Documents/projects/claude GARBAKING POS"
   ```

3. **Start the system:**
   ```bash
   ./start-all.sh
   ```

4. **Wait 10-15 seconds** for services to initialize

5. **Open in browser:**
   - Admin POS: http://localhost:3000
   - Backend Health: http://localhost:3001/health

---

## 📊 Verify It's Working

```bash
# Check backend
curl http://localhost:3001/health

# Should return:
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123.45
}
```

---

## 🆘 If Scripts Don't Work

### Manual Backend Start:
```bash
cd backend
npm install
npx prisma db push --accept-data-loss
npm run dev
```

### Manual Admin POS Start:
```bash
cd frontend/admin-pos
npm install
npm run dev
```

---

## 📝 Sample Login Credentials

After backend starts, use these accounts:
- **Admin**: admin@garbaking.com / admin123
- **Cashier**: cashier@garbaking.com / cashier123
- **Kitchen**: kitchen@garbaking.com / kitchen123

---

## 📁 Project Structure

```
claude GARBAKING POS/
├── backend/              ✅ Use this - Node.js/Fastify
├── frontend/
│   ├── admin-pos/       ✅ Admin interface
│   ├── customer-app/    ✅ Customer ordering
│   └── kds-app/         ✅ Kitchen display
├── garbaking-backend/   ❌ Ignore - Old Spring Boot
├── start-backend.sh     ✅ Backend startup script
├── start-all.sh         ✅ Full stack startup
└── docker-compose.yml   ❌ For old backend only
```

---

## 🎓 Why Docker Failed

The Docker Compose file tries to build:
- Spring Boot microservices (config-server, discovery-server, api-gateway)
- Multiple Java services (user-service, order-service, inventory-service)
- Kafka, Zookeeper, MySQL

**None of these are needed** for the current Node.js implementation.

---

## 💡 If You Want Docker

We can create a proper docker-compose for the Node.js stack:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
  
  admin-pos:
    build: ./frontend/admin-pos
    ports:
      - "3000:3000"
  
  # ... etc
```

But **startup scripts are simpler** for development!

---

## ✅ Summary

1. **DON'T** use `docker-compose up` (wrong backend)
2. **DON'T** go into `garbaking-backend/` directory
3. **DO** use `./start-all.sh` from project root
4. **DO** use the `backend/` directory for the Node.js backend

---

**Questions? Check:**
- `BACKEND_TROUBLESHOOTING.md`
- `BACKEND_CONNECTIVITY_SOLUTION.md`
