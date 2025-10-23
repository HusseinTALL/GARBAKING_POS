/**
 * Main entry point for the Admin POS application
 * Initializes Vue 3 app with router, store, and PWA capabilities
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Styles
import './style.css'
import './styles/admin-theme.css'

// Toast notifications
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// PWA
import { registerSW } from 'virtual:pwa-register'

// Permission directive
import permissionDirective from '@/directives/permission'

// Lucide Icons (replaces FontAwesome) - Icons imported directly in components

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(permissionDirective)

// Configure toast notifications
app.use(Toast, {
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false
})

app.mount('#app')

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to user to refresh the app
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
}