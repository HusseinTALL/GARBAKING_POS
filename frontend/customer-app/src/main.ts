/**
 * Main entry point for the Customer Ordering PWA
 * Initializes Vue 3 app with offline-first capabilities, i18n, and PWA features
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18n from '@/plugins/i18n'

// Styles
import './style.css'

// PWA
import { registerSW } from 'virtual:pwa-register'

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faShoppingCart,
  faPlus,
  faMinus,
  faHeart,
  faSearch,
  faFilter,
  faArrowLeft,
  faArrowRight,
  faTimes,
  faCheck,
  faUtensils,
  faClock,
  faMapMarkerAlt,
  faPhone,
  faUser,
  faEdit,
  faTrash,
  faStar,
  faStarHalfAlt,
  faWifi,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faExclamationTriangle,
  faSpinner,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons'

// Toast notifications
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Add icons to library
library.add(
  faShoppingCart,
  faPlus,
  faMinus,
  faHeart,
  faSearch,
  faFilter,
  faArrowLeft,
  faArrowRight,
  faTimes,
  faCheck,
  faUtensils,
  faClock,
  faMapMarkerAlt,
  faPhone,
  faUser,
  faEdit,
  faTrash,
  faStar,
  faStarHalfAlt,
  faWifi,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faExclamationTriangle,
  faSpinner,
  faEye,
  faEyeSlash
)

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(Toast, {
  position: POSITION.TOP_CENTER,
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
  rtl: false,
  transition: "Vue-Toastification__bounce",
  maxToasts: 3,
  newestOnTop: true
})
app.component('FontAwesomeIcon', FontAwesomeIcon)

app.mount('#app')

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Auto-update without prompting user for better UX
    updateSW(true)
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
}

// Handle app installation prompt
let deferredPrompt: any = null

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt = e
})

// Export for potential use in components
export { deferredPrompt }