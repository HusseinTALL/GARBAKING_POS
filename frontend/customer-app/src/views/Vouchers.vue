<script setup lang="ts">
/**
 * Vouchers - Available discount vouchers (Page 10 - UI/UX 4.4)
 *
 * Features:
 * - Voucher cards with discount info
 * - Claim/Apply buttons
 * - Expiry dates
 * - Terms and conditions
 * - Bottom navigation
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()

// Mock vouchers - replace with actual voucher store
const vouchers = ref([
  {
    id: '1',
    title: '50% OFF',
    subtitle: 'On your first order',
    code: 'FIRST50',
    minOrder: 20.00,
    expiryDate: '2024-12-31',
    type: 'percentage',
    discount: 50,
    isClaimed: false
  },
  {
    id: '2',
    title: '$10 OFF',
    subtitle: 'Orders above $30',
    code: 'SAVE10',
    minOrder: 30.00,
    expiryDate: '2024-12-25',
    type: 'fixed',
    discount: 10,
    isClaimed: false
  },
  {
    id: '3',
    title: 'FREE DELIVERY',
    subtitle: 'On all orders',
    code: 'FREEDEL',
    minOrder: 0,
    expiryDate: '2024-12-20',
    type: 'delivery',
    discount: 0,
    isClaimed: true
  },
  {
    id: '4',
    title: '25% OFF',
    subtitle: 'Weekend special',
    code: 'WEEKEND25',
    minOrder: 15.00,
    expiryDate: '2024-12-15',
    type: 'percentage',
    discount: 25,
    isClaimed: false
  }
])

const hasVouchers = computed(() => vouchers.value.length > 0)

function goBack() {
  router.back()
}

function claimVoucher(voucherId: string) {
  const voucher = vouchers.value.find(v => v.id === voucherId)
  if (voucher) {
    voucher.isClaimed = true
    // TODO: Save to voucher store
    console.log('Claimed voucher:', voucher.code)
  }
}

function applyVoucher(code: string) {
  // TODO: Apply voucher to cart
  console.log('Apply voucher:', code)
  router.push('/cart')
}

function getVoucherGradient(type: string): string {
  switch (type) {
    case 'percentage':
      return 'bg-gradient-to-br from-primary-500 to-primary-600'
    case 'fixed':
      return 'bg-gradient-to-br from-green-500 to-green-600'
    case 'delivery':
      return 'bg-gradient-to-br from-blue-500 to-blue-600'
    default:
      return 'bg-gradient-primary'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm pb-24">
    <!-- Header -->
    <div class="px-6 pt-8 pb-6 bg-white rounded-b-3xl shadow-sm">
      <div class="flex items-center justify-between">
        <button
          @click="goBack"
          class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
        >
          <i class="fas fa-arrow-left text-black"></i>
        </button>
        <h2 class="text-black font-bold text-lg">My Vouchers</h2>
        <div class="w-10"></div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 py-6">
      <!-- Vouchers List -->
      <div v-if="hasVouchers" class="space-y-4">
        <div
          v-for="voucher in vouchers"
          :key="voucher.id"
          class="bg-white rounded-3xl overflow-hidden shadow-lg"
        >
          <div class="flex">
            <!-- Left section - Discount Badge -->
            <div
              :class="[
                'w-32 flex flex-col items-center justify-center text-white p-6 relative',
                getVoucherGradient(voucher.type)
              ]"
            >
              <!-- Discount Amount -->
              <div class="text-center mb-2">
                <p class="text-3xl font-bold leading-none">
                  {{ voucher.type === 'percentage' ? `${voucher.discount}%` : voucher.type === 'fixed' ? `$${voucher.discount}` : '' }}
                </p>
                <p class="text-sm font-semibold mt-1">
                  {{ voucher.type === 'delivery' ? 'FREE' : 'OFF' }}
                </p>
              </div>

              <!-- Decorative circles -->
              <div class="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-warm rounded-full"></div>
            </div>

            <!-- Right section - Voucher Details -->
            <div class="flex-1 p-5">
              <div class="mb-3">
                <h3 class="text-black font-bold text-lg mb-1">{{ voucher.title }}</h3>
                <p class="text-black opacity-60 text-sm">{{ voucher.subtitle }}</p>
              </div>

              <!-- Voucher Code -->
              <div class="mb-3 flex items-center gap-2">
                <div class="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl px-4 py-2">
                  <p class="text-black font-mono font-bold text-center">{{ voucher.code }}</p>
                </div>
                <button
                  @click="navigator.clipboard.writeText(voucher.code)"
                  class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
                >
                  <i class="fas fa-copy text-black opacity-60 text-sm"></i>
                </button>
              </div>

              <!-- Details -->
              <div class="space-y-1 mb-3">
                <div class="flex items-center gap-2 text-xs">
                  <i class="fas fa-shopping-cart text-black opacity-40"></i>
                  <span class="text-black opacity-60">
                    Min. order: ${{ voucher.minOrder.toFixed(2) }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <i class="fas fa-calendar text-black opacity-40"></i>
                  <span class="text-black opacity-60">
                    Valid until {{ formatDate(voucher.expiryDate) }}
                  </span>
                </div>
              </div>

              <!-- Action Button -->
              <button
                v-if="!voucher.isClaimed"
                @click="claimVoucher(voucher.id)"
                class="w-full bg-gradient-primary text-white font-semibold py-3 rounded-2xl"
              >
                Claim Now
              </button>
              <button
                v-else
                @click="applyVoucher(voucher.code)"
                class="w-full bg-green-500 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2"
              >
                <i class="fas fa-check-circle"></i>
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 px-6">
        <div class="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <i class="fas fa-ticket text-gray-300 text-6xl"></i>
        </div>

        <h3 class="text-black font-bold text-xl mb-2 text-center">
          No Vouchers Available
        </h3>
        <p class="text-black opacity-60 text-center mb-8 max-w-xs">
          Check back later for exciting offers and discounts
        </p>

        <button
          @click="router.push('/home')"
          class="bg-gradient-primary text-white font-semibold px-8 py-4 rounded-2xl shadow-lg"
        >
          <i class="fas fa-home mr-2"></i>
          Back to Home
        </button>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
/* Add any component-specific styles */
</style>
