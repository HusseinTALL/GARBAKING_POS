# Garbaking POS System

A modern, offline-first Point of Sale system built with Vue 3 and Node.js, designed for restaurants and food service businesses.

## 🏗️ Architecture

- **Frontend**: Vue 3 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: SQLite (local) + PostgreSQL (cloud)
- **Real-time**: Socket.io for WebSocket communication
- **Hardware**: Raspberry Pi 4 + thermal printer integration

## 📂 Project Structure

```
garbaking-pos/
├── frontend/                    # Vue 3 applications
│   ├── customer-app/           # Customer ordering interface
│   ├── admin-pos/              # POS admin interface
│   ├── kds/                    # Kitchen Display System
│   └── shared/                 # Shared components/utils
├── backend/                    # Node.js API server
│   ├── src/                    # Source code
│   ├── database/              # Schema, migrations, seeds
│   └── tests/                 # API tests
├── hardware/                   # Raspberry Pi setup scripts
├── docker/                     # Container configurations
└── docs/                      # Documentation
```

## 🚀 Features

- **Offline-first design** with automatic sync
- **Multi-interface system** for customers, staff, and kitchen
- **Real-time order tracking** and notifications
- **Thermal printing** for receipts and kitchen tickets
- **Payment processing** (cash + card integration)
- **Analytics dashboard** with sales reporting
- **PWA capabilities** for mobile/tablet use

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Quick Start

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd garbaking-pos
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies
   cd backend && npm install && cd ..
   cd frontend/admin-pos && npm install && cd ../..
   cd frontend/customer-app && npm install && cd ../..
   ```

3. **Start all services** (Recommended)
   ```bash
   # Use the convenient management scripts
   ./start-all.sh
   ```

   **OR manually start each service:**
   ```bash
   # Backend API server (Terminal 1)
   cd backend && npm run dev

   # Admin POS (Terminal 2)
   cd frontend/admin-pos && npm run dev

   # Customer App (Terminal 3)
   cd frontend/customer-app && npm run dev
   ```

4. **Access applications**
   - Backend API: http://localhost:3001
   - Admin POS: http://localhost:3000
   - Customer App: http://localhost:3002

### 🎯 Management Scripts

We provide convenient bash scripts to manage all services:

```bash
# Start all services
./start-all.sh

# Stop all services
./stop-all.sh

# Restart all services
./restart-all.sh

# Check status of all services
./status.sh

# View logs interactively
./view-logs.sh
```

📖 For detailed script documentation, see [SCRIPTS.md](SCRIPTS.md)

## 📱 Interfaces

### Customer Ordering App
- Browse menu and add items to cart
- Place orders with customer information
- View order status and estimated time
- Payment processing

### Admin POS Interface
- Manage orders and payments
- View sales analytics
- Manage menu items and pricing
- User management

### Kitchen Display System (KDS)
- Real-time order display
- Order status management
- Timer and priority features
- Touch-friendly interface

## 🔧 Hardware Setup

### Raspberry Pi Configuration
```bash
# Flash Raspberry Pi OS
# Run setup script
cd hardware && ./setup-pi.sh
```

### Thermal Printer
- ESC/POS compatible printer
- USB or Ethernet connection
- Receipt and kitchen ticket printing

## 🔐 Security

- JWT-based authentication
- Input validation and sanitization
- HTTPS for cloud communications
- Local database encryption
- PCI compliance for payments

## 📊 Performance

- **Order Processing**: < 30 seconds
- **Offline Capability**: 8+ hours
- **Sync Performance**: < 5 minutes
- **Print Speed**: < 3 seconds
- **UI Responsiveness**: < 100ms

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend/admin-pos && npm test
```

## 🚀 Deployment

### Local Restaurant Deployment
```bash
# Build for production
npm run build

# Deploy to Raspberry Pi
npm run deploy:pi
```

### Cloud Deployment
```bash
# Deploy backend to cloud
npm run deploy:cloud

# Deploy frontend to CDN
npm run deploy:frontend
```

## 📖 Documentation

- [API Documentation](docs/api.md)
- [Hardware Setup Guide](docs/hardware.md)
- [Deployment Guide](docs/deployment.md)
- [User Manual](docs/user-manual.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@garbaking.com
- Documentation: [docs/](docs/)

---

Built with ❤️ for the restaurant industry