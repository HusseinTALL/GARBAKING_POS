# Kiosk App - Quick Start Guide

Get the kiosk app running in 5 minutes! 🚀

## Prerequisites

- Node.js 18+ installed
- Backend API running (optional for UI testing)

## Installation

```bash
# Navigate to kiosk app
cd frontend/kiosk-app

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The app will start on `http://localhost:3003` (or next available port).

## Quick Test

1. **Open browser**: Navigate to the URL shown in terminal
2. **Welcome screen**: Tap anywhere to start
3. **Select language**: Choose English/French/Arabic
4. **Select mode**: Choose Dine-in or Takeaway
5. **Browse menu**: Navigate categories (needs backend API)

## Without Backend API

The app will run but show empty menus. To test the UI:

1. All screens load correctly ✅
2. Navigation works ✅
3. Language switching works ✅
4. Idle timeout works ✅
5. Styling and animations work ✅

## With Backend API

Update `.env` file:
```env
VITE_API_URL=http://localhost:8080/api
```

Then restart the dev server:
```bash
npm run dev
```

Now you can:
- Browse real menu items
- Add items to cart
- Place orders
- Process payments

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Port already in use
Vite will automatically try the next available port (3004, 3005, etc.)

### API connection failed
- Check backend is running
- Verify `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### Blank screen
- Check browser console for errors
- Verify all dependencies installed
- Try clearing browser cache

## File Structure Overview

```
kiosk-app/
├── src/
│   ├── views/          # 7 screen components
│   ├── stores/         # State management
│   ├── services/       # API calls
│   ├── locales/        # Translations
│   └── router/         # Navigation
├── .env                # Configuration
└── package.json        # Dependencies
```

## Key URLs

- **Dev Server**: http://localhost:3003
- **Production Preview**: http://localhost:4173 (after build)
- **Backend API**: http://localhost:8080/api

## Next Steps

1. ✅ Test UI and navigation
2. 📖 Read [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md) for backend setup
3. 📖 Read [README.md](./README.md) for full documentation
4. 🎨 Customize colors and branding in `tailwind.config.js`
5. 🌍 Add more languages in `src/locales/`
6. 🚀 Deploy to production

## Support

- Check browser console for errors
- Review logs in terminal
- Refer to main README for detailed docs
- Check INTEGRATION-GUIDE for backend issues

---

**You're all set!** 🎉 The kiosk app is ready to use.
