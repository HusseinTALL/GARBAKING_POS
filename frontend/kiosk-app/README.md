# Garbaking Kiosk App

Self-service ordering kiosk application for Garbaking POS system. Built with Vue 3, TypeScript, Vite, and TailwindCSS.

## Features

- **7-Screen Flow**: Welcome → Language/Mode → Menu → Customize → Cart → Payment → Confirmation
- **Multi-language Support**: English, French, Arabic with RTL support
- **Touch-Optimized UI**: Large buttons (60px minimum), landscape layout
- **Order Modes**: Dine-in and takeaway
- **Payment Methods**: Card, mobile money, QR code, cash
- **Auto-Reset**: Idle detection with 60-second timeout
- **Offline Support**: PWA with IndexedDB caching
- **Real-time Updates**: WebSocket integration for order status

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite 4
- **Styling**: TailwindCSS 3
- **State Management**: Pinia with persistence
- **Routing**: Vue Router 4
- **i18n**: Vue I18n 9
- **HTTP Client**: Axios
- **PWA**: Vite PWA Plugin

## Prerequisites

- Node.js 18+ and npm
- Backend API running on port 8080

## Installation

```bash
# Navigate to kiosk app directory
cd frontend/kiosk-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your API URL if needed
```

## Development

```bash
# Start development server on port 3003
npm run dev

# App will be available at http://localhost:3003
```

## Build

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint
```

## Project Structure

```
kiosk-app/
├── src/
│   ├── assets/          # CSS and static assets
│   ├── components/      # Reusable Vue components
│   ├── composables/     # Vue composables
│   ├── locales/         # i18n translation files
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── ar.json
│   ├── router/          # Vue Router configuration
│   ├── services/        # API service layer
│   ├── stores/          # Pinia stores
│   │   ├── cart.ts      # Shopping cart management
│   │   ├── menu.ts      # Menu data
│   │   ├── order.ts     # Order processing
│   │   └── settings.ts  # Kiosk settings
│   ├── types/           # TypeScript type definitions
│   ├── views/           # Page components (7 screens)
│   │   ├── WelcomeScreen.vue
│   │   ├── LanguageModeScreen.vue
│   │   ├── MenuScreen.vue
│   │   ├── ItemCustomizationScreen.vue
│   │   ├── CartSummaryScreen.vue
│   │   ├── PaymentScreen.vue
│   │   └── ConfirmationScreen.vue
│   ├── App.vue          # Root component
│   ├── main.ts          # App entry point
│   └── i18n.ts          # i18n configuration
├── public/              # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Screen Flow

1. **Welcome Screen**: Idle/attract screen with "Touch to Start"
2. **Language/Mode Selection**: Choose language and dine-in/takeaway
3. **Menu Screen**: Browse items by category
4. **Item Customization**: Configure options and quantity
5. **Cart Summary**: Review order and edit items
6. **Payment Selection**: Choose payment method
7. **Confirmation**: Display order number, auto-reset after 10s

## Configuration

### Environment Variables

- `VITE_API_URL`: Backend API base URL
- `VITE_WS_URL`: WebSocket URL for real-time updates
- `VITE_DEFAULT_LANGUAGE`: Default UI language (en/fr/ar)
- `VITE_IDLE_TIMEOUT`: Seconds before idle reset (default: 60)

### Kiosk Settings

Settings can be modified in the settings store or via admin panel:

- Tax rate
- Payment methods enabled/disabled
- Idle timeout duration
- Language preferences

## Customization

### Adding a New Language

1. Create locale file: `src/locales/{code}.json`
2. Add to `SUPPORTED_LANGUAGES` in `src/i18n.ts`
3. Import in i18n messages

### Adjusting Touch Targets

Modify `tailwind.config.js`:

```js
spacing: {
  'touch': '60px',      // Minimum touch target
  'touch-lg': '80px',
  'touch-xl': '100px',
}
```

## Deployment

### Docker

```bash
# Build image
docker build -t garbaking-kiosk .

# Run container
docker run -p 3003:80 garbaking-kiosk
```

### Raspberry Pi

For kiosk deployment on Raspberry Pi:

1. Install Chromium in kiosk mode
2. Set auto-start to URL: `http://localhost:3003`
3. Disable screen timeout and screensaver
4. Configure touch calibration

## Troubleshooting

### API Connection Issues

- Verify `VITE_API_URL` in `.env`
- Check backend is running on specified port
- Review CORS settings on backend

### Idle Detection Not Working

- Check browser doesn't have dev tools open
- Verify `VITE_IDLE_TIMEOUT` is set correctly
- Test user interactions trigger activity

### Translation Missing

- Check locale file has all required keys
- Verify language code in `SUPPORTED_LANGUAGES`
- Check i18n fallback locale is set

## License

Proprietary - Garbaking POS System

## Support

For issues and questions, contact the development team.
