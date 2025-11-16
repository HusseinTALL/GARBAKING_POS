<!--
  BottomNavigation - Main navigation bar (UI/UX 4.4 Design)
  Simple 4-icon navigation with Font Awesome icons
-->

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom z-50">
    <div class="max-w-md mx-auto px-6 py-3 pb-safe-bottom">
      <nav class="flex items-center justify-around">
        <!-- Home -->
        <button
          @click="navigateTo('home')"
          :class="[
            'flex flex-col items-center gap-1 transition-all duration-200 active:scale-95',
            currentTab === 'home' ? 'text-primary-500' : 'text-black opacity-40'
          ]"
        >
          <i class="fas fa-home text-xl"></i>
          <span class="text-xs font-semibold">{{ t('navigation.home') }}</span>
        </button>

        <!-- Favorites -->
        <button
          @click="navigateTo('favorites')"
          :class="[
            'flex flex-col items-center gap-1 transition-all duration-200 active:scale-95',
            currentTab === 'favorites' ? 'text-primary-500' : 'text-black opacity-40'
          ]"
        >
          <i class="fas fa-heart text-xl"></i>
          <span class="text-xs font-semibold">{{ t('navigation.favorites') }}</span>
        </button>

        <!-- Orders -->
        <button
          @click="navigateTo('orders')"
          :class="[
            'flex flex-col items-center gap-1 transition-all duration-200 active:scale-95',
            currentTab === 'orders' ? 'text-primary-500' : 'text-black opacity-40'
          ]"
        >
          <i class="fas fa-shopping-bag text-xl"></i>
          <span class="text-xs font-semibold">{{ t('navigation.orders') }}</span>
        </button>

        <!-- Profile -->
        <button
          @click="navigateTo('profile')"
          :class="[
            'flex flex-col items-center gap-1 transition-all duration-200 active:scale-95',
            currentTab === 'profile' ? 'text-primary-500' : 'text-black opacity-40'
          ]"
        >
          <i class="fas fa-user text-xl"></i>
          <span class="text-xs font-semibold">{{ t('navigation.profile') }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// Determine current tab from route
const currentTab = computed(() => {
  const path = route.path
  if (path === '/' || path === '/home') return 'home'
  if (path.startsWith('/favorites')) return 'favorites'
  if (path.startsWith('/orders') || path.startsWith('/order-')) return 'orders'
  if (path.startsWith('/profile')) return 'profile'
  return 'home'
})

// Navigation handlers
const navigateTo = (tab: string) => {
  const routes: Record<string, string> = {
    home: '/home',
    favorites: '/favorites',
    orders: '/orders',
    profile: '/profile'
  }

  const targetRoute = routes[tab]
  if (targetRoute && route.path !== targetRoute) {
    router.push(targetRoute)
  }
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
