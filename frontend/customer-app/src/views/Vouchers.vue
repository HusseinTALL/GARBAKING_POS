<!--
  Vouchers View - Display available vouchers and promo codes
  Shows promotional offers, discount coupons with claim functionality
-->

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">My Vouchers</h1>
          <button
            @click="showMyVouchers = !showMyVouchers"
            class="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl font-medium text-sm hover:bg-primary-100 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
            </svg>
            My Claimed ({{ unusedCount }})
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-md mx-auto px-4 py-6">
      <!-- My Claimed Vouchers Section -->
      <div v-if="showMyVouchers && hasClaimedVouchers" class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-900">Claimed Vouchers</h2>
          <button
            @click="showMyVouchers = false"
            class="text-sm text-primary-600 font-semibold hover:text-primary-700"
          >
            View All
          </button>
        </div>

        <!-- Claimed vouchers list -->
        <div class="space-y-3">
          <VoucherCard
            v-for="voucher in unusedClaimedVouchers"
            :key="voucher.id"
            :voucher="voucher"
            :is-claimed="true"
            @claim="handleClaim"
            @view-details="showVoucherDetails"
          />
        </div>

        <!-- Used vouchers (collapsed) -->
        <div v-if="usedVouchers.length > 0" class="mt-6">
          <button
            @click="showUsedVouchers = !showUsedVouchers"
            class="w-full text-left px-4 py-3 bg-white rounded-2xl border border-gray-200 flex items-center justify-between hover:border-gray-300 transition-colors"
          >
            <span class="text-sm font-semibold text-gray-700">Used Vouchers ({{ usedVouchers.length }})</span>
            <svg
              class="w-5 h-5 text-gray-400 transition-transform"
              :class="{ 'rotate-180': showUsedVouchers }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="showUsedVouchers" class="mt-3 space-y-3">
            <VoucherCard
              v-for="voucher in usedVouchers"
              :key="voucher.id"
              :voucher="voucher"
              :is-claimed="true"
              :is-used="true"
              @view-details="showVoucherDetails"
            />
          </div>
        </div>
      </div>

      <!-- Category Filter -->
      <div v-if="!showMyVouchers" class="mb-6">
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all"
            :class="selectedCategory === category.id
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300'"
          >
            <span class="mr-1">{{ category.icon }}</span>
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-3xl p-6 shadow-sm animate-pulse">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div class="w-16 h-16 bg-gray-200 rounded-2xl"></div>
          </div>
          <div class="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      <!-- Available Vouchers List -->
      <div v-else-if="!showMyVouchers && filteredVouchers.length > 0" class="space-y-4">
        <VoucherCard
          v-for="voucher in filteredVouchers"
          :key="voucher.id"
          :voucher="voucher"
          :is-claimed="isVoucherClaimed(voucher.id)"
          @claim="handleClaim"
          @view-details="showVoucherDetails"
        />
      </div>

      <!-- Empty state -->
      <div v-else-if="!showMyVouchers && !isLoading" class="text-center py-16">
        <div class="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">No Vouchers Available</h3>
        <p class="text-gray-600 mb-6 max-w-xs mx-auto">
          Check back later for exclusive deals and amazing discounts!
        </p>
        <button
          @click="goToHome"
          class="px-6 py-3 bg-primary-500 text-white rounded-2xl text-sm font-semibold hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary-500/30"
        >
          Continue Shopping
        </button>
      </div>

      <!-- Empty claimed vouchers -->
      <div v-else-if="showMyVouchers && !hasClaimedVouchers" class="text-center py-16">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">No Claimed Vouchers</h3>
        <p class="text-gray-600 mb-6 max-w-xs mx-auto">
          Claim vouchers to save on your orders!
        </p>
        <button
          @click="showMyVouchers = false"
          class="px-6 py-3 bg-primary-500 text-white rounded-2xl text-sm font-semibold hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary-500/30"
        >
          Browse Vouchers
        </button>
      </div>
    </main>

    <!-- Voucher Details Modal -->
    <VoucherDetailsModal
      v-if="selectedVoucher"
      :voucher="selectedVoucher"
      :is-claimed="isVoucherClaimed(selectedVoucher.id)"
      @close="selectedVoucher = null"
      @claim="handleClaim"
    />

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useVoucherStore } from '@/stores/vouchers'
import { voucherCategories } from '@/services/voucherService'
import type { Voucher } from '@/types/voucher'
import BottomNavigation from '@/components/BottomNavigation.vue'
import VoucherCard from '@/components/VoucherCard.vue'
import VoucherDetailsModal from '@/components/VoucherDetailsModal.vue'

const router = useRouter()
const toast = useToast()
const voucherStore = useVoucherStore()

// State
const selectedCategory = ref('all')
const showMyVouchers = ref(false)
const showUsedVouchers = ref(false)
const selectedVoucher = ref<Voucher | null>(null)

// Computed
const categories = computed(() => voucherCategories)
const isLoading = computed(() => voucherStore.isLoading)
const hasClaimedVouchers = computed(() => voucherStore.hasClaimedVouchers)
const unusedClaimedVouchers = computed(() => voucherStore.unusedClaimedVouchers)
const usedVouchers = computed(() => voucherStore.usedVouchers)
const unusedCount = computed(() => voucherStore.unusedClaimedVouchers.length)

const filteredVouchers = computed(() => {
  return voucherStore.availableVouchers
})

// Methods
const loadVouchers = async () => {
  if (selectedCategory.value === 'all') {
    await voucherStore.fetchAvailableVouchers()
  } else {
    await voucherStore.fetchVouchersByCategory(selectedCategory.value)
  }
}

const isVoucherClaimed = (voucherId: string): boolean => {
  return voucherStore.isVoucherClaimed(voucherId)
}

const handleClaim = (voucher: Voucher) => {
  const success = voucherStore.claimVoucher(voucher)
  if (success) {
    toast.success(`${voucher.title} claimed successfully!`)
  } else {
    toast.error('Voucher already claimed')
  }
}

const showVoucherDetails = (voucher: Voucher) => {
  selectedVoucher.value = voucher
}

const goToHome = () => {
  router.push('/home')
}

// Watch category changes
watch(selectedCategory, () => {
  loadVouchers()
})

// Initialize
onMounted(() => {
  loadVouchers()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
