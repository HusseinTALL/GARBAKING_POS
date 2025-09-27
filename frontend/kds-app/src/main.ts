/**
 * Main entry point for the Kitchen Display System (KDS) application
 * Initializes Vue 3 app with minimal dependencies for fullscreen kitchen display
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Styles
import './style.css'

// PWA
import { registerSW } from 'virtual:pwa-register'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Auto-update for KDS to ensure latest features
    updateSW(true)
  },
  onOfflineReady() {
    console.log('KDS ready to work offline')
  },
})

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('KDS Error:', err, info)
}