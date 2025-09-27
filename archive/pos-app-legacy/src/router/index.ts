/**
 * Vue Router configuration for Garbaking Cashier POS
 * Defines routes for order taking, payment processing, and cashier operations
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import views
import Login from '@/views/Login.vue'
import NewPOS from '@/views/NewPOS.vue'
import Payment from '@/views/Payment.vue'
import CustomerDisplay from '@/views/CustomerDisplay.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'POS',
    component: NewPOS,
    meta: { requiresAuth: true, title: 'Point of Sale' }
  },
  {
    path: '/payment/:orderId?',
    name: 'Payment',
    component: Payment,
    props: true,
    meta: { requiresAuth: true, title: 'Payment Processing' }
  },
  {
    path: '/customer-display',
    name: 'CustomerDisplay',
    component: CustomerDisplay,
    meta: { requiresAuth: false, title: 'Customer Display' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('pos_cashier_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

// Set page title
router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} - Garbaking Cashier POS`
    : 'Garbaking Cashier POS'
})

export default router