<!--
  Bottom navigation bar component
  Modern iOS-style tab bar with 5 navigation items
-->

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
    <div class="max-w-md mx-auto px-2 pt-2 pb-safe-bottom">
      <nav class="flex items-center justify-around">
        <!-- Home -->
        <button
          @click="navigateTo('home')"
          :class="[
            'flex flex-col items-center justify-center min-w-[60px] py-1 transition-colors',
            currentTab === 'home' ? 'text-primary-500' : 'text-gray-500'
          ]"
        >
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="text-[10px] font-medium">{{ t('navigation.home') }}</span>
        </button>

        <!-- Favorites -->
        <button
          @click="navigateTo('favorites')"
          :class="[
            'flex flex-col items-center justify-center min-w-[60px] py-1 transition-colors',
            currentTab === 'favorites' ? 'text-primary-500' : 'text-gray-500'
          ]"
        >
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <span class="text-[10px] font-medium">{{ t('navigation.favorites') }}</span>
        </button>

        <!-- Cart -->
        <button
          @click="navigateTo('cart')"
          :class="[
            'flex flex-col items-center justify-center min-w-[60px] py-1 transition-colors relative',
            currentTab === 'cart' ? 'text-primary-500' : 'text-gray-500'
          ]"
        >
          <div class="relative">
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span v-if="cartCount > 0" class="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {{ cartCount > 9 ? '9+' : cartCount }}
            </span>
          </div>
          <span class="text-[10px] font-medium">{{ t('navigation.cart') }}</span>
        </button>

        <!-- Voucher -->
        <button
          @click="navigateTo('voucher')"
          :class="[
            'flex flex-col items-center justify-center min-w-[60px] py-1 transition-colors',
            currentTab === 'voucher' ? 'text-primary-500' : 'text-gray-500'
          ]"
        >
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <span class="text-[10px] font-medium">{{ t('navigation.voucher') }}</span>
        </button>

        <!-- Profile -->
        <button
          @click="navigateTo('profile')"
          :class="[
            'flex flex-col items-center justify-center min-w-[60px] py-1 transition-colors',
            currentTab === 'profile' ? 'text-primary-500' : 'text-gray-500'
          ]"
        >
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span class="text-[10px] font-medium">{{ t('navigation.profile') }}</span>
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
  if (path.startsWith('/voucher')) return 'voucher'
  if (path.startsWith('/profile')) return 'profile'
  return 'home'
})

// Navigation handlers
const navigateTo = (tab: string) => {
  const routes: Record<string, string> = {
    home: '/home',
    favorites: '/favorites',
    cart: '/cart',
    voucher: '/vouchers',
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
