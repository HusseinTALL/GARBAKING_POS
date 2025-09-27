# Garbaking Customer Ordering PWA

A Vue 3 Progressive Web App (PWA) for at-table self-ordering with offline-first architecture, designed for restaurants and food service businesses.

## 🚀 Features

### Core Features
- **Offline-First Design**: Full functionality works without internet connection
- **Menu Browsing**: Categorized menu with images, descriptions, and dietary tags
- **Shopping Cart**: Add/remove items, adjust quantities, view totals
- **Order Management**: Submit orders, track status, view history
- **Real-time Updates**: Live order status updates (accepted → preparing → ready)
- **Multilingual Support**: Switch between English and French
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support

### Technical Features
- **PWA Capabilities**: Installable, offline caching, background sync
- **IndexedDB Storage**: Local data persistence for orders and sync queue
- **Service Worker**: Asset caching and offline API request handling
- **Responsive Design**: Mobile-first, touch-friendly interface
- **TypeScript**: Type-safe development with full TypeScript support

## 📱 User Experience

### Ordering Flow
1. **Browse Menu**: View categorized menu items with images and dietary info
2. **Add to Cart**: Touch-friendly add/remove with quantity controls
3. **Place Order**: Enter table number/name, review order summary
4. **Track Status**: Real-time status updates with visual progress bar
5. **Order History**: View past orders with status and details

### Accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Touch Targets**: Minimum 48px touch targets for mobile
- **High Contrast**: WCAG compliant color ratios
- **Alternative Text**: Image descriptions for all menu items

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API) + TypeScript
- **Build Tool**: Vite with PWA plugin
- **Styling**: Tailwind CSS with custom restaurant theme
- **Storage**: LocalForage (IndexedDB wrapper)
- **Internationalization**: Vue I18n
- **PWA**: Workbox for service worker and caching
- **Mock API**: Simulated backend with realistic delays

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# App will be available at http://localhost:3001
```

### Build for Production
```bash
# Build PWA for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 🔧 Configuration

### Environment Variables
Create `.env.local` file for local development:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_STORE_ID=store_local
```

### PWA Configuration
PWA settings in `vite.config.ts`:
- **Manifest**: App name, icons, theme colors
- **Service Worker**: Caching strategies, offline support
- **Background Sync**: Queue failed requests for retry

### Internationalization
Add languages in `src/assets/i18n/`:
- `en.json` - English translations
- `fr.json` - French translations

## 📱 Testing Offline Mode

### Desktop (Chrome/Edge)
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Check **Offline** checkbox
4. Refresh page - app should work offline

### Mobile Testing
1. Enable Airplane Mode
2. Open the PWA
3. Browse menu, add items to cart
4. Submit order (will queue for sync)
5. Disable Airplane Mode - order syncs automatically

## 🌐 PWA Installation

### Desktop
- **Chrome**: Click install icon in address bar
- **Edge**: Click app install button in address bar

### Mobile
- **iOS Safari**: Share → Add to Home Screen
- **Android Chrome**: Install app prompt automatically appears

## 📊 Mock Data

### Menu Structure
```typescript
interface MenuItem {
  sku: string           // Product SKU (e.g., "ATT001")
  category: string      // Category (Mains, Drinks, etc.)
  name: string         // Item name
  price: number        // Price in FCFA
  description: string  // Item description
  image: string       // Placeholder image URL
  tags: string[]      // Dietary tags (vegetarian, spicy, etc.)
}
```

### Order Structure
```typescript
interface Order {
  clientOrderId: string    // UUID v4 client ID
  localOrderId?: string   // Local order ID (LOCAL####)
  storeId: string        // Store identifier
  createdAt: string      // ISO timestamp
  customer: {
    name: string         // Table number or customer name
    type: 'onsite'
  }
  items: OrderItem[]     // Order items with quantities
  total: number         // Total amount
  idempotencyKey: string // UUID v4 for deduplication
  payment: {
    method: 'cash'
    status: 'pending'
  }
  status: 'queued' | 'accepted' | 'preparing' | 'ready' | 'synced'
  synced: boolean       // Sync status
}
```

## 🔄 Offline Sync Logic

### Order Queue
- Orders stored in IndexedDB when submitted
- Background sync attempts when online
- Visual indicators for sync status
- Manual retry option for failed syncs

### Sync Strategy
1. **Immediate**: Try to sync when online
2. **Background**: Queue for background sync when offline
3. **Retry**: Exponential backoff for failed requests
4. **Deduplication**: Idempotency keys prevent duplicates

## 🎨 Design System

### Colors (Restaurant Theme)
- **Primary**: Orange (#F97316) - warm, appetizing
- **Background**: Light gray (#F9FAFB) - clean, minimal
- **Text**: Dark gray (#111827) - high contrast
- **Success**: Green (#10B981) - order ready
- **Warning**: Yellow (#F59E0B) - offline mode

### Typography
- **Headings**: Bold, readable fonts
- **Body**: Regular weight, comfortable reading
- **UI Text**: Medium weight for buttons/labels

### Layout
- **Grid**: 1 column mobile, 2-3 columns tablet/desktop
- **Spacing**: Consistent 4px grid system
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Touch-friendly 48px minimum height

## 🚀 Performance Optimization

### Bundle Optimization
- **Code Splitting**: Vendor chunks separated
- **Tree Shaking**: Unused code eliminated
- **Asset Optimization**: Images and fonts optimized

### Caching Strategy
- **App Shell**: Critical assets cached first
- **API Data**: Network-first with cache fallback
- **Images**: Cache-first strategy
- **Static Assets**: Cache-first with versioning

## 🔒 Security Considerations

### Data Protection
- No sensitive data stored locally
- Order data encrypted in transit
- Idempotency keys prevent replay attacks

### API Security
- Input validation on all forms
- XSS protection via Vue's built-in escaping
- CSRF protection through SameSite cookies

## 🐛 Troubleshooting

### Common Issues

**App not working offline**
- Check service worker registration in DevTools
- Verify caching strategy in Network tab
- Clear cache and reload

**Orders not syncing**
- Check network connectivity
- Open DevTools → Application → IndexedDB
- Verify sync queue entries

**PWA not installable**
- Ensure HTTPS (required for PWA)
- Check manifest.json validity
- Verify service worker active

**Language not changing**
- Clear localStorage
- Check browser language settings
- Verify translation files loaded

### Debug Mode
Enable debug logging by adding to console:
```javascript
localStorage.setItem('debug', 'true')
```

## 📈 Analytics & Monitoring

### Key Metrics
- **Order Completion Rate**: Orders submitted vs completed
- **Offline Usage**: Time spent in offline mode
- **Sync Success Rate**: Percentage of successful syncs
- **User Engagement**: Time on app, pages per session

### Performance Metrics
- **Load Time**: Time to interactive
- **Cache Hit Rate**: Offline resource loading
- **Bundle Size**: JavaScript payload size
- **Core Web Vitals**: LCP, FID, CLS scores

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Make changes with TypeScript
4. Test offline functionality
5. Submit pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Vue 3 + TypeScript rules
- **Prettier**: Consistent formatting
- **Commits**: Conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for Garbaking Restaurant**

For support or questions, please check the issues section of the repository.