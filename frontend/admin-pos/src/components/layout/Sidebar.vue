<!--
  Modern Vertical Sidebar Component
  Icon-based navigation with active state indicators
  Based on Jaegar Resto design specifications
-->
<template>
  <aside class="sidebar">
    <!-- Logo/Brand -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <UtensilsCrossed class="w-7 h-7" />
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ 'nav-item-active': isActive(item.path) }"
        :data-tooltip="item.label"
      >
        <component :is="item.icon" class="nav-icon" />
      </router-link>
    </nav>

    <!-- Bottom Actions -->
    <div class="sidebar-footer">
      <button class="nav-item" data-tooltip="Notifications">
        <Bell class="nav-icon" />
        <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
      </button>

      <button class="nav-item" data-tooltip="Settings" @click="$router.push('/settings')">
        <Settings class="nav-icon" />
      </button>

      <button class="nav-item" data-tooltip="Sign Out" @click="handleLogout">
        <LogOut class="nav-icon" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  LayoutGrid,
  UtensilsCrossed,
  CookingPot,
  Gift,
  BarChart3,
  CreditCard,
  Receipt,
  Users,
  Package,
  Settings,
  Bell,
  LogOut
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Navigation items
const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    path: '/orders/new',
    label: 'New Order',
    icon: ShoppingCart
  },
  {
    path: '/orders',
    label: 'Orders',
    icon: ChefHat
  },
  {
    path: '/tables',
    label: 'Tables',
    icon: LayoutGrid
  },
  {
    path: '/menu',
    label: 'Menu',
    icon: UtensilsCrossed
  },
  {
    path: '/inventory',
    label: 'Inventory',
    icon: Package
  },
  {
    path: '/kitchen',
    label: 'Kitchen Display',
    icon: CookingPot
  },
  {
    path: '/loyalty',
    label: 'Loyalty Program',
    icon: Gift
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: BarChart3
  },
  {
    path: '/payment',
    label: 'Payments',
    icon: CreditCard
  },
  {
    path: '/receipts',
    label: 'Receipts',
    icon: Receipt
  },
  {
    path: '/users',
    label: 'Users',
    icon: Users
  }
]

// Mock notification count (replace with real store data)
const notificationCount = computed(() => 0)

const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleLogout = async () => {
  if (confirm('Are you sure you want to sign out?')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-brand {
  padding: 12px 0;
  margin-bottom: 32px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-orange), #FF8C5A);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  transition: all 0.3s;
  cursor: pointer;
}

.brand-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 0 12px;
}

.nav-item {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  text-decoration: none;
}

.nav-item:hover {
  background: rgba(255, 107, 53, 0.1);
  color: var(--accent-orange);
}

.nav-item-active {
  background: var(--accent-orange);
  color: white !important;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.nav-item-active:hover {
  background: #FF8C5A;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

/* Notification Badge */
.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--accent-red);
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 6px rgba(244, 67, 54, 0.4);
}

/* Tooltip on Hover */
.nav-item[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(26, 26, 46, 0.95);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-small);
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 1000;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.nav-item:hover[data-tooltip]::after {
  opacity: 1;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 0 12px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
    padding: 12px 0;
  }

  .nav-item {
    width: 48px;
    height: 48px;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
  }

  .brand-icon {
    width: 40px;
    height: 40px;
  }
}

/* Hide sidebar on very small screens */
@media (max-width: 640px) {
  .sidebar {
    display: none;
  }
}
</style>
