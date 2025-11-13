<!--
  Orders View - Main orders list page
  Displays order history with filters, search, and status tabs
-->

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <div class="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-40 safe-area-top">
      <div class="px-4 py-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('orders.title') }}
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ $t('orders.subtitle', { count: orderStore.orders.length }) }}
        </p>
      </div>

      <!-- Status tabs -->
      <div class="px-4 pb-3">
        <div class="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            @click="selectTab(tab.value)"
            class="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
            :class="getTabClass(tab.value)"
          >
            <span class="flex items-center gap-2">
              {{ tab.label }}
              <span
                v-if="tab.count > 0"
                class="px-2 py-0.5 rounded-full text-xs font-bold"
                :class="getTabCountClass(tab.value)"
              >
                {{ tab.count }}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 py-6">
      <!-- Filters (collapsible) -->
      <div class="mb-6">
        <button
          @click="showFilters = !showFilters"
          class="w-full flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4"
        >
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ $t('orders.filters') }}
            </span>
            <span
              v-if="hasActiveFilters"
              class="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
            >
              {{ activeFilterCount }}
            </span>
          </div>
          <svg
            class="w-5 h-5 text-gray-400 transition-transform"
            :class="{ 'rotate-180': showFilters }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <transition name="slide-down">
          <div v-if="showFilters" class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <OrderFilters
              v-model="filters"
              @search="handleSearch"
            />
          </div>
        </transition>
      </div>

      <!-- Loading state -->
      <div v-if="orderStore.isLoading && !orderStore.hasOrders" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">{{ $t('orders.loading') }}</p>
      </div>

      <!-- Error state -->
      <div v-else-if="orderStore.error" class="text-center py-12">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('orders.error.title') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ orderStore.error }}</p>
        <button
          @click="refreshOrders"
          class="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          {{ $t('orders.retry') }}
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!orderStore.hasOrders" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('orders.empty.title') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ $t('orders.empty.description') }}
        </p>
        <button
          @click="$router.push('/home')"
          class="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          {{ $t('orders.empty.action') }}
        </button>
      </div>

      <!-- Filtered empty state -->
      <div v-else-if="displayedOrders.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('orders.noResults.title') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ $t('orders.noResults.description') }}
        </p>
        <button
          @click="clearFilters"
          class="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
        >
          {{ $t('orders.clearFilters') }}
        </button>
      </div>

      <!-- Orders list -->
      <div v-else class="space-y-4">
        <OrderCard
          v-for="order in displayedOrders"
          :key="order.id"
          :order="order"
          @click="viewOrderDetails"
          @reorder="handleReorder"
          @view-details="viewOrderDetails"
        />

        <!-- Refresh button -->
        <button
          @click="refreshOrders"
          :disabled="orderStore.isLoading"
          class="w-full py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            class="w-5 h-5"
            :class="{ 'animate-spin': orderStore.isLoading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {{ orderStore.isLoading ? $t('orders.refreshing') : $t('orders.refresh') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { useOrderStore } from '@/stores/order'
import { useCartStore } from '@/stores/cart'
import type { Order, OrderFilters as OrderFiltersType } from '@/stores/order'

// Components
import OrderCard from '@/components/OrderCard.vue'
import OrderFilters from '@/components/OrderFilters.vue'

const router = useRouter()
const { t } = useI18n()
const toast = useToast()

// Stores
const orderStore = useOrderStore()
const cartStore = useCartStore()

// Local state
const showFilters = ref(false)
const selectedTab = ref<'all' | 'active' | 'completed' | 'cancelled'>('all')
const filters = ref<OrderFiltersType>({
  status: 'ALL',
  orderType: 'ALL'
})

// Computed
const statusTabs = computed(() => [
  {
    value: 'all',
    label: t('orders.tabs.all'),
    count: orderStore.orders.length
  },
  {
    value: 'active',
    label: t('orders.tabs.active'),
    count: orderStore.activeOrders.length
  },
  {
    value: 'completed',
    label: t('orders.tabs.completed'),
    count: orderStore.completedOrders.length
  },
  {
    value: 'cancelled',
    label: t('orders.tabs.cancelled'),
    count: orderStore.cancelledOrders.length
  }
])

const displayedOrders = computed(() => {
  let orders: Order[]

  // Filter by tab
  switch (selectedTab.value) {
    case 'active':
      orders = orderStore.activeOrders
      break
    case 'completed':
      orders = orderStore.completedOrders
      break
    case 'cancelled':
      orders = orderStore.cancelledOrders
      break
    default:
      orders = orderStore.filteredOrders
  }

  return orders
})

const hasActiveFilters = computed(() => {
  return (
    (filters.value.status && filters.value.status !== 'ALL') ||
    (filters.value.orderType && filters.value.orderType !== 'ALL') ||
    filters.value.dateRange ||
    (filters.value.searchQuery && filters.value.searchQuery.trim() !== '')
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.status && filters.value.status !== 'ALL') count++
  if (filters.value.orderType && filters.value.orderType !== 'ALL') count++
  if (filters.value.dateRange) count++
  if (filters.value.searchQuery && filters.value.searchQuery.trim() !== '') count++
  return count
})

// Methods
function selectTab(tab: 'all' | 'active' | 'completed' | 'cancelled') {
  selectedTab.value = tab

  // Reset filters when switching tabs
  if (tab !== 'all') {
    orderStore.clearFilters()
    filters.value = {
      status: 'ALL',
      orderType: 'ALL'
    }
  }
}

function getTabClass(tab: string): string {
  const isActive = selectedTab.value === tab
  if (isActive) {
    return 'bg-primary-600 text-white shadow-md'
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
}

function getTabCountClass(tab: string): string {
  const isActive = selectedTab.value === tab
  if (isActive) {
    return 'bg-white/20 text-white'
  }
  return 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
}

function handleSearch(query: string) {
  orderStore.setSearchQuery(query)
}

function clearFilters() {
  orderStore.clearFilters()
  filters.value = {
    status: 'ALL',
    orderType: 'ALL'
  }
}

async function refreshOrders() {
  const customerPhone = cartStore.customerInfo.phone
  if (customerPhone) {
    await orderStore.fetchOrderHistory(customerPhone)
    toast.success(t('orders.refreshSuccess'))
  } else {
    toast.warning(t('orders.noCustomerPhone'))
  }
}

function viewOrderDetails(order: Order) {
  router.push(`/order-status/${order.orderNumber}`)
}

function handleReorder(order: Order) {
  const itemCount = orderStore.reorderOrder(order)
  toast.success(t('orders.reorderSuccess', { count: itemCount }))
  router.push('/home')
}

// Watch filters and update store
import { watch } from 'vue'
watch(filters, (newFilters) => {
  orderStore.setFilters(newFilters)
}, { deep: true })

// Lifecycle
onMounted(async () => {
  // Fetch orders if customer phone is available
  const customerPhone = cartStore.customerInfo.phone
  if (customerPhone && !orderStore.hasOrders) {
    await orderStore.fetchOrderHistory(customerPhone)
  }
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
