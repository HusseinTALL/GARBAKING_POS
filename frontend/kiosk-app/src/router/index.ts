/**
 * Vue Router configuration for kiosk app navigation
 * Defines routes for all 7 kiosk screens with proper flow management
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'welcome',
    component: () => import('@/views/WelcomeScreen.vue'),
    meta: { title: 'Welcome' }
  },
  {
    path: '/language',
    name: 'language',
    component: () => import('@/views/LanguageModeScreen.vue'),
    meta: { title: 'Select Language & Mode' }
  },
  {
    path: '/menu',
    name: 'menu',
    component: () => import('@/views/MenuScreen.vue'),
    meta: { title: 'Menu' }
  },
  {
    path: '/customize/:itemId',
    name: 'customize',
    component: () => import('@/views/ItemCustomizationScreen.vue'),
    meta: { title: 'Customize Item' },
    props: true
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartSummaryScreen.vue'),
    meta: { title: 'Your Order' }
  },
  {
    path: '/payment',
    name: 'payment',
    component: () => import('@/views/PaymentScreen.vue'),
    meta: { title: 'Payment' }
  },
  {
    path: '/confirmation',
    name: 'confirmation',
    component: () => import('@/views/ConfirmationScreen.vue'),
    meta: { title: 'Order Confirmed' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard to update page title
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Kiosk'} - Garbaking`
  next()
})

export default router
