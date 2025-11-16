<!--
  BottomNavigation - Professional bottom navigation with smooth animations
  Features: Floating design, animated indicator, micro-interactions, glassmorphism
-->

<template>
  <div class="fixed bottom-0 left-0 right-0 pb-safe z-50 pointer-events-none">
    <div class="max-w-md mx-auto px-4 pb-4 pointer-events-auto">
      <!-- Floating Navigation Container -->
      <nav class="relative bg-white/95 backdrop-blur-xl rounded-[24px] shadow-nav border border-white/20">
        <!-- Animated Indicator Background -->
        <div 
          class="absolute top-1/2 -translate-y-1/2 h-12 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-[16px] transition-all duration-500 ease-out"
          :style="indicatorStyle"
        />
        
        <!-- Navigation Items -->
        <div class="relative flex items-center justify-around px-2 py-3">
          <NavItem
            v-for="item in navItems"
            :key="item.id"
            :icon="item.icon"
            :label="t(item.label)"
            :active="currentTab === item.id"
            @click="navigateTo(item.id)"
          />
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavItem from './NavItem.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

interface NavigationItem {
  id: string
  icon: string
  label: string
  route: string
}

const navItems: NavigationItem[] = [
  { id: 'home', icon: 'fa-house', label: 'navigation.home', route: '/home' },
  { id: 'favorites', icon: 'fa-heart', label: 'navigation.favorites', route: '/favorites' },
  { id: 'orders', icon: 'fa-bag-shopping', label: 'navigation.orders', route: '/orders' },
  { id: 'profile', icon: 'fa-user', label: 'navigation.profile', route: '/profile' }
]

// Determine current tab from route
const currentTab = computed(() => {
  const path = route.path
  if (path === '/' || path === '/home') return 'home'
  if (path.startsWith('/favorites')) return 'favorites'
  if (path.startsWith('/orders') || path.startsWith('/order-')) return 'orders'
  if (path.startsWith('/profile')) return 'profile'
  return 'home'
})

// Calculate indicator position
const indicatorStyle = computed(() => {
  const index = navItems.findIndex(item => item.id === currentTab.value)
  const itemWidth = 100 / navItems.length
  const left = index * itemWidth + itemWidth / 2
  
  return {
    left: `${left}%`,
    transform: 'translate(-50%, -50%)',
    width: '64px'
  }
})

// Navigation handler
const navigateTo = (tab: string) => {
  const item = navItems.find(i => i.id === tab)
  if (item && route.path !== item.route) {
    router.push(item.route)
  }
}
</script>