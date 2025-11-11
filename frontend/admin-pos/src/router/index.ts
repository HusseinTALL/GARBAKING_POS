/**
 * Vue Router configuration for Admin POS
 * Defines routes and navigation guards with permission-based access control
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import views
import MainLayout from '@/layouts/MainLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Orders from '@/views/Orders.vue'
import NewOrder from '@/views/NewOrder.vue'
import Menu from '@/views/Menu.vue'
import Analytics from '@/views/Analytics.vue'
import Settings from '@/views/Settings.vue'
import Tables from '@/views/Tables.vue'
import Payment from '@/views/Payment.vue'
import CashReports from '@/views/CashReports.vue'
import Receipts from '@/views/Receipts.vue'
import Loyalty from '@/views/Loyalty.vue'
import InventoryDashboard from '@/views/inventory/InventoryDashboard.vue'
import InventoryItems from '@/views/inventory/InventoryItems.vue'
import PurchaseOrders from '@/views/inventory/PurchaseOrders.vue'
import EmployeeDashboard from '@/views/employees/EmployeeDashboard.vue'
import EmployeeList from '@/views/employees/EmployeeList.vue'
import TimeClock from '@/views/employees/TimeClock.vue'
import Timesheet from '@/views/employees/Timesheet.vue'
import TimeOff from '@/views/employees/TimeOff.vue'
import ScheduleCalendar from '@/views/employees/ScheduleCalendar.vue'
import EmployeeAvailability from '@/views/employees/EmployeeAvailability.vue'
import ShiftSwap from '@/views/employees/ShiftSwap.vue'
import PayrollDashboard from '@/views/employees/PayrollDashboard.vue'
import PerformanceReviews from '@/views/employees/PerformanceReviews.vue'
import TrainingCertifications from '@/views/employees/TrainingCertifications.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    // Redirect to dashboard for development (auth not implemented yet)
    redirect: '/'
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
        component: NewOrder,
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
        component: () => import('@/components/KitchenDisplay.vue'),
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
        path: '/cash-reports',
        name: 'cash-reports',
        component: CashReports,
        meta: {
          title: 'Cash Reports',
          feature: 'cash-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/inventory',
        name: 'inventory-dashboard',
        component: InventoryDashboard,
        meta: {
          title: 'Inventory Dashboard',
          feature: 'inventory-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/inventory/items',
        name: 'inventory-items',
        component: InventoryItems,
        meta: {
          title: 'Inventory Items',
          feature: 'inventory-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/inventory/purchase-orders',
        name: 'purchase-orders',
        component: PurchaseOrders,
        meta: {
          title: 'Purchase Orders',
          feature: 'inventory-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/employees',
        name: 'employee-dashboard',
        component: EmployeeDashboard,
        meta: {
          title: 'Employee Dashboard',
          feature: 'employee-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/employees/list',
        name: 'employee-list',
        component: EmployeeList,
        meta: {
          title: 'Employees',
          feature: 'employee-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/employees/time-clock',
        name: 'time-clock',
        component: TimeClock,
        meta: {
          title: 'Time Clock',
          feature: 'employee-management'
        }
      },
      {
        path: '/employees/timesheet',
        name: 'timesheet',
        component: Timesheet,
        meta: {
          title: 'Timesheets',
          feature: 'employee-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/employees/time-off',
        name: 'time-off',
        component: TimeOff,
        meta: {
          title: 'Time Off',
          feature: 'employee-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/employees/schedule',
        name: 'schedule-calendar',
        component: ScheduleCalendar,
        meta: {
          title: 'Schedule Calendar',
          feature: 'employee-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/employees/availability',
        name: 'employee-availability',
        component: EmployeeAvailability,
        meta: {
          title: 'Employee Availability',
          feature: 'employee-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/employees/shift-swaps',
        name: 'shift-swaps',
        component: ShiftSwap,
        meta: {
          title: 'Shift Swaps',
          feature: 'employee-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/employees/payroll',
        name: 'payroll',
        component: PayrollDashboard,
        meta: {
          title: 'Payroll',
          feature: 'employee-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/employees/performance',
        name: 'performance-reviews',
        component: PerformanceReviews,
        meta: {
          title: 'Performance Reviews',
          feature: 'employee-management',
          minRole: 'MANAGER'
        }
      },
      {
        path: '/employees/training',
        name: 'training-certifications',
        component: TrainingCertifications,
        meta: {
          title: 'Training & Certifications',
          feature: 'employee-management',
          minRole: 'MANAGER'
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
      },
      {
        path: '/loyalty',
        name: 'loyalty',
        component: Loyalty,
        meta: {
          title: 'Loyalty Program',
          feature: 'loyalty-management'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards - TEMPORARILY DISABLED FOR DEVELOPMENT
// TODO: Re-enable when backend auth endpoints are implemented
router.beforeEach(async (to, from, next) => {
  // Bypass all auth for development - allow direct access to dashboard
  next()
  return

  /* DISABLED FOR DEVELOPMENT
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
  */
})

// Set page title
router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} - Garbaking Admin POS`
    : 'Garbaking Admin POS'
})

export default router
