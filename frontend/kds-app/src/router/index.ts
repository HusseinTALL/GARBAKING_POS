/**
 * Vue Router configuration for Admin POS
 * Defines routes and navigation guards with permission-based access control
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard, permissionGuard, roleRedirectGuard, storeAccessGuard } from './guards'

// Import views
import MainLayout from '@/layouts/MainLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Orders from '@/views/Orders.vue'
import Menu from '@/views/Menu.vue'
import Analytics from '@/views/Analytics.vue'
import Settings from '@/views/Settings.vue'
import Tables from '@/views/Tables.vue'
import Payment from '@/views/Payment.vue'
import Receipts from '@/views/Receipts.vue'
import Login from '@/views/Login.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: Dashboard,
        meta: {
          title: 'Dashboard',
          feature: 'dashboard'
        }
      },
      {
        path: '/dashboard',
        redirect: '/'
      },
      {
        path: '/orders',
        name: 'orders',
        component: Orders,
        meta: {
          title: 'Orders',
          feature: 'orders'
        }
      },
      {
        path: '/orders/new',
        name: 'new-order',
        component: Orders,
        meta: {
          title: 'New Order',
          permission: 'orders:create'
        }
      },
      {
        path: '/menu',
        name: 'menu',
        component: Menu,
        meta: {
          title: 'Menu Management',
          feature: 'menu-management'
        }
      },
      {
        path: '/analytics',
        name: 'analytics',
        component: Analytics,
        meta: {
          title: 'Sales Analytics',
          feature: 'analytics'
        }
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('@/views/Users.vue'),
        meta: {
          title: 'User Management',
          feature: 'user-management'
        }
      },
      {
        path: '/kitchen',
        name: 'kitchen',
        component: () => import('@/views/Kitchen.vue'),
        meta: {
          title: 'Kitchen Display',
          feature: 'kitchen-display'
        }
      },
      {
        path: '/settings',
        name: 'settings',
        component: Settings,
        meta: {
          title: 'Settings',
          feature: 'system-settings'
        }
      },
      {
        path: '/tables',
        name: 'tables',
        component: Tables,
        meta: {
          title: 'Table Management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/payment',
        name: 'payment',
        component: Payment,
        meta: {
          title: 'Payment Processing',
          feature: 'cash-management'
        }
      },
      {
        path: '/receipts',
        name: 'receipts',
        component: Receipts,
        meta: {
          title: 'Receipt Management',
          feature: 'reports'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards - Applied in order
router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  // Try to load authentication from storage
  if (!authStore.isAuthenticated) {
    await authStore.loadFromStorage()
  }

  // Skip to login if accessing login page
  if (to.path === '/login') {
    if (authStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
    return
  }

  // Apply guards in sequence
  authGuard(to, from, (result) => {
    if (result === false || typeof result === 'string' || (typeof result === 'object' && result)) {
      next(result)
      return
    }

    permissionGuard(to, from, (result) => {
      if (result === false || typeof result === 'string' || (typeof result === 'object' && result)) {
        next(result)
        return
      }

      roleRedirectGuard(to, from, (result) => {
        if (result === false || typeof result === 'string' || (typeof result === 'object' && result)) {
          next(result)
          return
        }

        storeAccessGuard(to, from, next)
      })
    })
  })
})

// Set page title
router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} - Garbaking Admin POS`
    : 'Garbaking Admin POS'
})

export default router