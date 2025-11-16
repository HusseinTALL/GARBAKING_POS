<!--
  Bottom navigation bar component
  Modern iOS-style tab bar with 5 navigation items
-->

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-2 border-gray-200 safe-area-bottom z-50 shadow-2xl">
    <div class="max-w-md mx-auto px-3 pt-3 pb-safe-bottom">
      <nav class="flex items-center justify-around">
        <!-- Home -->
        <button
          @click="navigateTo('home')"
          :class="[
            'flex flex-col items-center justify-center min-w-[68px] py-2 px-3 rounded-2xl transition-all duration-300',
            currentTab === 'home' ? 'text-primary-600 bg-primary-50 shadow-card scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          ]"
        >
          <svg class="w-7 h-7 mb-1.5" :fill="currentTab === 'home' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24" :stroke-width="currentTab === 'home' ? '1.5' : '2'">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="text-[11px] font-bold">{{ t('navigation.home') }}</span>
        </button>

        <!-- Favorites -->
        <button
          @click="navigateTo('favorites')"
          :class="[
            'flex flex-col items-center justify-center min-w-[68px] py-2 px-3 rounded-2xl transition-all duration-300',
            currentTab === 'favorites' ? 'text-secondary-600 bg-secondary-50 shadow-card scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          ]"
        >
          <svg class="w-7 h-7 mb-1.5" :fill="currentTab === 'favorites' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24" :stroke-width="currentTab === 'favorites' ? '1.5' : '2'">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <span class="text-[11px] font-bold">{{ t('navigation.favorites') }}</span>
        </button>

        <!-- Cart -->
        <button
          @click="navigateTo('cart')"
          :class="[
            'flex flex-col items-center justify-center min-w-[68px] py-2 px-3 rounded-2xl transition-all duration-300 relative',
            currentTab === 'cart' ? 'text-accent-600 bg-accent-50 shadow-card scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          ]"
        >
          <div class="relative">
            <svg class="w-7 h-7 mb-1.5" :fill="currentTab === 'cart' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24" :stroke-width="currentTab === 'cart' ? '1.5' : '2'">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span v-if="cartCount > 0" class="absolute -top-1 -right-1 bg-secondary-500 text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center shadow-button-red ring-2 ring-white">
              {{ cartCount > 9 ? '9+' : cartCount }}
            </span>
          </div>
          <span class="text-[11px] font-bold">{{ t('navigation.cart') }}</span>
        </button>

        <!-- Orders -->
        <button
          @click="navigateTo('orders')"
          :class="[
            'flex flex-col items-center justify-center min-w-[68px] py-2 px-3 rounded-2xl transition-all duration-300',
            currentTab === 'orders' ? 'text-warning-700 bg-warning-50 shadow-card scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          ]"
        >
          <svg class="w-7 h-7 mb-1.5" :fill="currentTab === 'orders' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24" :stroke-width="currentTab === 'orders' ? '1.5' : '2'">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="text-[11px] font-bold">{{ t('navigation.orders') }}</span>
        </button>

        <!-- Profile -->
        <button
          @click="navigateTo('profile')"
          :class="[
            'flex flex-col items-center justify-center min-w-[68px] py-2 px-3 rounded-2xl transition-all duration-300',
            currentTab === 'profile' ? 'text-gray-900 bg-gray-200 shadow-card scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          ]"
        >
          <svg class="w-7 h-7 mb-1.5" :fill="currentTab === 'profile' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24" :stroke-width="currentTab === 'profile' ? '1.5' : '2'">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span class="text-[11px] font-bold">{{ t('navigation.profile') }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const cartStore = useCartStore()

// Get cart count from store
const cartCount = computed(() => cartStore.itemCount)

// Determine current tab from route
const currentTab = computed(() => {
  const path = route.path
  if (path === '/' || path === '/home') return 'home'
  if (path.startsWith('/favorites')) return 'favorites'
  if (path.startsWith('/cart')) return 'cart'
  if (path.startsWith('/orders') || path.startsWith('/order-')) return 'orders'
  if (path.startsWith('/profile')) return 'profile'
  return 'home'
})

// Navigation handlers
const navigateTo = (tab: string) => {
  const routes: Record<string, string> = {
    home: '/home',
    favorites: '/favorites',
    cart: '/cart',
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
