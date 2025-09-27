/**
 * Main entry point for Garbaking Cashier POS application
 * Sets up Vue app with router, stores, and essential plugins
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')