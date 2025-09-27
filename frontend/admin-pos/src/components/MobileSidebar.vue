<!--
  Mobile sidebar component for responsive navigation
  Provides mobile-optimized navigation menu with proper touch interactions
-->

<template>
  <div class="h-full flex flex-col bg-slate-800/95 backdrop-blur-xl">
    <!-- Mobile Header -->
    <div class="flex items-center justify-between p-6 border-b border-white/10">
      <div class="flex items-center">
        <div class="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg mr-3 flex items-center justify-center">
          <Utensils class="text-white w-4 h-4" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-white">Garbaking POS</h1>
          <p class="text-xs text-white/60">Admin Dashboard</p>
        </div>
      </div>
      <button
        @click="$emit('close')"
        class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Mobile Navigation -->
    <nav class="flex-1 p-6 space-y-2">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.route"
        :class="[
          'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
          isActiveRoute(item.route)
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        ]"
        @click="$emit('close')"
      >
        <component
          :is="item.icon"
          :class="[
            'mr-3 w-5 h-5',
            isActiveRoute(item.route) ? 'text-white' : 'text-white/60 group-hover:text-white'
          ]"
        />
        {{ item.label }}
        <span
          v-if="item.badge"
          :class="[
            'ml-auto px-2 py-1 text-xs font-medium rounded-full',
            isActiveRoute(item.route)
              ? 'bg-white text-indigo-600'
              : 'bg-white/20 text-white/80'
          ]"
        >
          {{ item.badge }}
        </span>
      </router-link>
    </nav>

    <!-- Mobile User Info -->
    <div class="p-6 border-t border-white/10">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User class="text-white w-4 h-4" />
        </div>
        <div>
          <p class="text-sm font-medium text-white">{{ currentUser.name }}</p>
          <p class="text-xs text-white/60">{{ currentUser.role }}</p>
        </div>
      </div>
      <button
        @click="logout"
        class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
      >
        <LogOut class="mr-2 w-4 h-4" />
        Sign Out
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Utensils, X, PieChart, ShoppingBag, TrendingUp, Settings, User, LogOut } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Define emits
defineEmits<{
  close: []
}>()

// Navigation items
const navigationItems = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    route: '/',
    icon: PieChart,
    badge: null
  },
  {
    name: 'orders',
    label: 'Orders',
    route: '/orders',
    icon: ShoppingBag,
    badge: '12'
  },
  {
    name: 'menu',
    label: 'Menu',
    route: '/menu',
    icon: Utensils,
    badge: null
  },
  {
    name: 'analytics',
    label: 'Analytics',
    route: '/analytics',
    icon: TrendingUp,
    badge: null
  },
  {
    name: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: Settings,
    badge: null
  }
]

// Computed properties
const currentUser = computed(() => authStore.currentUser || {
  name: 'Admin User',
  role: 'Administrator'
})

const isActiveRoute = (routePath: string): boolean => {
  return route.path === routePath
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>