<!--
  Vouchers View - Display available vouchers and promo codes
  Shows promotional offers and discount coupons
-->

<template>
  <div class="min-h-screen bg-white pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-text-DEFAULT">My Vouchers</h1>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-md mx-auto px-4 py-6">
      <!-- Promo banner -->
      <div class="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-6 mb-6 text-white">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-sm font-medium opacity-90 mb-1">Special Offer</p>
            <h2 class="text-2xl font-bold">25% OFF</h2>
            <p class="text-sm opacity-90 mt-1">On your first order</p>
          </div>
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p class="text-xs opacity-80 mb-1">Promo Code</p>
            <p class="font-mono font-bold text-lg">FIRST25</p>
          </div>
          <button
            @click="copyCode('FIRST25')"
            class="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            {{ copiedCode === 'FIRST25' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>

      <!-- Available Vouchers Section -->
      <div class="mb-4">
        <h3 class="text-lg font-bold text-text-DEFAULT mb-3">Available Vouchers</h3>
      </div>

      <!-- Empty state -->
      <div class="text-center py-12">
        <div class="w-20 h-20 bg-background-gray rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-text-DEFAULT mb-2">No vouchers available</h3>
        <p class="text-text-secondary text-sm mb-6 max-w-xs mx-auto">
          Check back later for exclusive deals and discounts
        </p>
        <button
          @click="goToHome"
          class="px-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const toast = useToast()

const copiedCode = ref<string | null>(null)

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    copiedCode.value = code
    toast.success('Promo code copied to clipboard!')

    // Reset after 2 seconds
    setTimeout(() => {
      copiedCode.value = null
    }, 2000)
  } catch (error) {
    toast.error('Failed to copy code')
  }
}

const goToHome = () => {
  router.push('/home')
}
</script>
