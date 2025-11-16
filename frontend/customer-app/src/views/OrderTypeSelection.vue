<script setup lang="ts">
/**
 * OrderTypeSelection - Choose delivery method (Page 2)
 *
 * Features:
 * - Select order type (Delivery/Takeaway/Dine-in)
 * - Visual cards with icons and estimated times
 * - Skip option for later selection
 */

import { useRouter } from 'vue-router'
import { useOrderModeStore } from '@/stores/orderMode'
import type { OrderType } from '@/stores/orderMode'

const router = useRouter()
const orderModeStore = useOrderModeStore()

interface OrderOption {
  type: OrderType
  title: string
  description: string
  icon: string
  time: string
  timeIcon: string
  gradient: string
}

const orderOptions: OrderOption[] = [
  {
    type: 'delivery',
    title: 'Delivery',
    description: 'Get it delivered to your doorstep',
    icon: 'fa-motorcycle',
    time: '20-30 min',
    timeIcon: 'fa-clock',
    gradient: 'from-primary-400 to-primary-600'
  },
  {
    type: 'takeaway',
    title: 'Takeaway',
    description: 'Pick up your order yourself',
    icon: 'fa-shopping-bag',
    time: '15-20 min',
    timeIcon: 'fa-clock',
    gradient: 'from-accent-green-400 to-accent-green-500'
  },
  {
    type: 'dine-in',
    title: 'Dine-in',
    description: 'Enjoy your meal at the restaurant',
    icon: 'fa-utensils',
    time: 'Reserve table',
    timeIcon: 'fa-chair',
    gradient: 'from-accent-purple-400 to-accent-purple-500'
  }
]

function selectOrderType(type: OrderType) {
  orderModeStore.setMode(type)
  router.push('/home')
}

function skip() {
  // Default to delivery and go to home
  orderModeStore.setMode('delivery')
  router.push('/home')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm flex flex-col px-8 py-16">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-black font-bold text-3xl mb-3 leading-tight">
        How would you like<br>to receive your order?
      </h1>
      <p class="text-black opacity-60">Choose your preferred dining option</p>
    </div>

    <!-- Order Type Cards -->
    <div class="flex-1 flex flex-col justify-center space-y-4">
      <!-- Delivery Option -->
      <button
        v-for="option in orderOptions"
        :key="option.type"
        @click="selectOrderType(option.type)"
        class="bg-white rounded-3xl p-6 shadow-lg border-2 border-transparent hover:border-primary-500 transition-all active:scale-[0.98]"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center flex-shrink-0"
            :class="option.gradient"
          >
            <i :class="`fas ${option.icon} text-3xl text-white`"></i>
          </div>
          <div class="flex-1 text-left">
            <h3 class="text-black font-bold text-lg mb-1">{{ option.title }}</h3>
            <p class="text-black opacity-60 text-sm">{{ option.description }}</p>
            <div class="flex items-center gap-2 mt-2">
              <i
                :class="`fas ${option.timeIcon} text-xs`"
                class="text-primary-500"
                :style="option.type !== 'delivery' ? `color: ${option.type === 'takeaway' ? '#10b981' : '#a855f7'}` : ''"
              ></i>
              <span class="text-black text-xs font-semibold">{{ option.time }}</span>
            </div>
          </div>
          <i class="fas fa-chevron-right text-black opacity-30"></i>
        </div>
      </button>
    </div>

    <!-- Skip Option -->
    <button
      @click="skip"
      class="text-black opacity-60 text-sm font-semibold mt-6"
    >
      Skip for now
    </button>
  </div>
</template>

<style scoped>
/* Add any component-specific styles if needed */
</style>
