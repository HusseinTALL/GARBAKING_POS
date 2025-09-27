# Development Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)
- Git

### 1. Clone and Install
```bash
git clone <repository-url>
cd garbaking-pos
npm install
```

### 2. Environment Setup
```bash
# Copy environment files
cp .env.example backend/.env
cp .env.development frontend/admin-pos/.env.local
```

### 3. Database Setup
```bash
# Generate Prisma client and setup database
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Start Development Servers

#### Option A: Manual Start (Recommended for development)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Admin POS
cd frontend/admin-pos
npm run dev

# Access applications
# Admin POS: http://localhost:3000
# API: http://localhost:8000
```

#### Option B: Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Project Structure

```
garbaking-pos/
├── frontend/
│   ├── admin-pos/          # Vue 3 Admin POS (Port: 3000)
│   ├── customer-app/       # Vue 3 Customer App (Port: 3001)
│   ├── kds/                # Vue 3 Kitchen Display (Port: 3002)
│   └── shared/             # Shared components
├── backend/                # Node.js API Server (Port: 8000)
├── hardware/               # Raspberry Pi scripts
├── docker/                 # Container configurations
└── docs/                   # Documentation
```

## Available Commands

### Root Level
```bash
npm run dev          # Start all development servers
npm run build        # Build all applications
npm run test         # Run all tests
npm run lint         # Lint all code
npm run format       # Format all code
```

### Backend Commands
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run test         # Run tests
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run database migrations
```

### Frontend Commands
```bash
cd frontend/admin-pos
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
```

## Development Workflow

1. **Feature Development**
   - Create feature branch from main
   - Make changes in appropriate directory
   - Run tests and linting
   - Submit pull request

2. **Database Changes**
   - Modify `backend/prisma/schema.prisma`
   - Run `npm run db:migrate`
   - Update TypeScript types if needed

3. **Frontend Changes**
   - Components go in `src/components/`
   - Views go in `src/views/`
   - Stores go in `src/stores/`
   - Types go in `src/types/`

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Kill processes on ports
   npx kill-port 3000 8000
   ```

2. **Database issues**
   ```bash
   # Reset database
   cd backend
   npm run db:reset
   ```

3. **Node modules issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Docker issues**
   ```bash
   # Clean docker
   docker-compose down -v
   docker system prune -f
   ```

### Environment Variables

Key environment variables to configure:

- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: JWT signing secret
- `VITE_API_URL`: Frontend API endpoint
- `STORE_ID`: Unique store identifier

## Next Steps

After completing the setup:

1. **Phase 2**: Implement core backend API endpoints
2. **Phase 3**: Build customer ordering interface
3. **Phase 4**: Complete admin POS features
4. **Phase 5**: Add Kitchen Display System
5. **Phase 6**: Implement real-time features
6. **Phase 7**: Add offline capabilities
7. **Phase 8**: Hardware integration
8. **Phase 9**: Testing and deployment

## Additional Resources

- [Vue 3 Documentation](https://v3.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)

## Support

For development questions:
- Check existing documentation in `docs/`
- Create an issue for bugs
- Reach out to the development team