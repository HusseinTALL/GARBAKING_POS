<!--
  Admin POS Main Layout - Professional admin dashboard layout
  Provides sidebar navigation with Vue Router integration
-->

<template>
  <div class="min-h-screen bg-slate-900 flex">
    <!-- Desktop Sidebar -->
    <aside class="w-20 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-6">
      <!-- Logo -->
      <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-8 shadow-lg">
        <UtensilsCrossed class="text-white text-xl" />
      </div>

      <!-- Navigation Icons -->
      <nav class="flex flex-col space-y-3">
        <router-link
          v-for="item in sidebarItems"
          :key="item.name"
          :to="item.path"
          class="w-12 h-12 flex items-center justify-center rounded-xl relative group performance-optimized"
          :class="{ 'bg-blue-500 text-white shadow-lg': $route.path === item.path }"
          style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translate3d(0, 0, 0); will-change: transform, background-color;"
        >
          <!-- Active Indicator -->
          <div
            v-if="$route.path === item.path"
            class="absolute left-0 w-1 h-8 bg-blue-400 rounded-r-full"
          ></div>
          <component
            :is="item.icon"
            class="text-xl"
            :class="{ 'text-white': $route.path === item.path, 'text-slate-400': $route.path !== item.path }"
          />
          <!-- Tooltip -->
          <div class="absolute left-16 bg-slate-700 text-white px-2 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap performance-optimized"
               style="transition: opacity 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translate3d(4px, 0, 0); will-change: opacity, transform;">
            {{ item.label }}
          </div>
        </router-link>
      </nav>

      <!-- Bottom Icons -->
      <div class="mt-auto flex flex-col space-y-3">
        <button class="w-12 h-12 flex items-center justify-center rounded-xl group performance-optimized interactive-fast">
          <MessageCircle class="text-xl text-slate-400" />
          <div class="absolute left-16 bg-slate-700 text-white px-2 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap performance-optimized"
               style="transition: opacity 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translate3d(4px, 0, 0); will-change: opacity, transform;">
            Support
          </div>
        </button>
      </div>
    </aside>

    <!-- Mobile Top Navigation -->
    <div class="md:hidden fixed top-0 left-0 right-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between z-50">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <UtensilsCrossed class="text-white text-lg" />
        </div>
        <h1 class="text-xl font-bold text-white">Garbaking Admin</h1>
      </div>
      <button @click="showMobileMenu = !showMobileMenu">
        <Menu class="w-6 h-6 text-white" />
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="md:hidden fixed inset-0 bg-black/50 z-50" @click="showMobileMenu = false">
      <div class="fixed top-0 right-0 w-64 h-full bg-slate-800 border-l border-slate-700 p-4" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-white">Navigation</h2>
          <button @click="showMobileMenu = false">
            <X class="w-6 h-6 text-white" />
          </button>
        </div>
        <nav class="space-y-2">
          <router-link
            v-for="item in sidebarItems"
            :key="item.name"
            :to="item.path"
            @click="showMobileMenu = false"
            class="flex items-center space-x-3 px-3 py-2 rounded-lg performance-optimized"
            :class="{ 'bg-blue-500 text-white': $route.path === item.path, 'text-slate-300': $route.path !== item.path }"
            style="transition: background-color 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: translate3d(0, 0, 0); will-change: transform, background-color;"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-slate-800 border-b border-slate-700 px-6 py-4 hidden md:block">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">{{ currentPageTitle }}</h1>
            <p class="text-slate-400 text-sm">{{ getCurrentTime() }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Role indicator -->
            <div v-if="authStore.userRole" class="flex items-center space-x-2">
              <div
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: authStore.roleColor }"
              ></div>
              <span class="text-sm text-slate-400">{{ authStore.roleDisplayName }}</span>
            </div>

            <!-- Status indicator -->
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm text-slate-400">Online</span>
            </div>

            <!-- User info -->
            <div class="flex items-center space-x-2">
              <span class="text-sm text-slate-300">{{ authStore.displayName }}</span>
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                :style="{ backgroundColor: authStore.roleColor }"
              >
                {{ authStore.displayName.charAt(0).toUpperCase() }}
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-auto p-6 pt-20 md:pt-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'
import { useAuthStore } from '@/stores/auth'
import {
  UtensilsCrossed,
  MessageCircle,
  LayoutGrid,
  Receipt,
  Menu as MenuIcon,
  TrendingUp,
  Settings,
  Table2,
  CreditCard,
  FileText,
  Menu,
  X,
  Users,
  ChefHat
} from 'lucide-vue-next'

// Reactive state
const showMobileMenu = ref(false)
const currentTime = ref(new Date())

const route = useRoute()
const permissions = usePermissions()
const authStore = useAuthStore()

// All possible sidebar navigation items with permission requirements
const allSidebarItems = [
  {
    name: 'dashboard',
    path: '/',
    icon: LayoutGrid,
    label: 'Dashboard',
    feature: 'dashboard'
  },
  {
    name: 'orders',
    path: '/orders',
    icon: Receipt,
    label: 'Orders',
    feature: 'orders'
  },
  {
    name: 'menu',
    path: '/menu',
    icon: MenuIcon,
    label: 'Menu',
    feature: 'menu-management'
  },
  {
    name: 'analytics',
    path: '/analytics',
    icon: TrendingUp,
    label: 'Analytics',
    feature: 'analytics'
  },
  {
    name: 'users',
    path: '/users',
    icon: Users,
    label: 'Users',
    feature: 'user-management'
  },
  {
    name: 'tables',
    path: '/tables',
    icon: Table2,
    label: 'Tables',
    requireRole: ['MANAGER', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    name: 'payment',
    path: '/payment',
    icon: CreditCard,
    label: 'Payment',
    feature: 'cash-management'
  },
  {
    name: 'receipts',
    path: '/receipts',
    icon: FileText,
    label: 'Reports',
    feature: 'reports'
  },
  {
    name: 'kitchen',
    path: '/kitchen',
    icon: ChefHat,
    label: 'Kitchen',
    feature: 'kitchen-display'
  },
  {
    name: 'settings',
    path: '/settings',
    icon: Settings,
    label: 'Settings',
    feature: 'system-settings'
  }
]

// Filter sidebar items based on user permissions and role
const sidebarItems = computed(() => {
  return allSidebarItems.filter(item => {
    // Check feature-based access
    if (item.feature) {
      return permissions.canAccessFeatureByName(item.feature)
    }

    // Check role-based access
    if (item.requireRole) {
      return permissions.hasAnyRole(item.requireRole)
    }

    // Default: show if no restrictions
    return true
  })
})

// Computed properties
const currentPageTitle = computed(() => {
  const currentRoute = sidebarItems.value.find(item => item.path === route.path)
  return currentRoute?.label || 'Dashboard'
})

// Methods
const getCurrentTime = () => {
  return currentTime.value.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Update time every minute
let timeInterval: number

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #1e293b;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 2px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Router link active styling */
.router-link-active {
  @apply bg-blue-500 text-white;
}

/* Mobile menu animations */
@media (max-width: 768px) {
  .fixed.right-0 {
    animation: slideInRight 0.3s ease-out;
  }
}

@keyframes slideInRight {
  from {
    transform: translate3d(100%, 0, 0);
    opacity: 0;
  }
  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}
</style>