<!--
  OrderFilters Component - Filter and search orders
  Provides status, order type, date range filters and search
-->

<template>
  <div class="space-y-4">
    <!-- Search bar -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('orders.searchPlaceholder')"
        class="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        @input="$emit('search', searchQuery)"
      />
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Filter chips - Status -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ $t('orders.filterByStatus') }}
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="status in statusOptions"
          :key="status.value"
          @click="selectStatus(status.value)"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          :class="getStatusChipClass(status.value)"
        >
          {{ status.label }}
        </button>
      </div>
    </div>

    <!-- Filter chips - Order Type -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ $t('orders.filterByType') }}
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in orderTypeOptions"
          :key="type.value"
          @click="selectOrderType(type.value)"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          :class="getOrderTypeChipClass(type.value)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path :d="type.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- Date Range Filter (collapsible) -->
    <div>
      <button
        @click="showDateRange = !showDateRange"
        class="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        <span>{{ $t('orders.filterByDate') }}</span>
        <svg
          class="w-5 h-5 transition-transform"
          :class="{ 'rotate-180': showDateRange }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <transition name="slide-down">
        <div v-if="showDateRange" class="space-y-3 mt-2">
          <!-- Quick date filters -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="range in dateRangePresets"
              :key="range.value"
              @click="selectDateRange(range.value)"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="getDateRangeChipClass(range.value)"
            >
              {{ range.label }}
            </button>
          </div>

          <!-- Custom date inputs -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                {{ $t('orders.from') }}
              </label>
              <input
                v-model="customStartDate"
                type="date"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                @change="applyCustomDateRange"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                {{ $t('orders.to') }}
              </label>
              <input
                v-model="customEndDate"
                type="date"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                @change="applyCustomDateRange"
              />
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Active filters summary and clear button -->
    <div v-if="hasActiveFilters" class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
      <span class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('orders.activeFilters', { count: activeFilterCount }) }}
      </span>
      <button
        @click="clearAllFilters"
        class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        {{ $t('orders.clearFilters') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { OrderStatus, OrderType } from '@/types'

interface Props {
  modelValue: {
    status?: OrderStatus | 'ALL'
    orderType?: OrderType | 'ALL'
    dateRange?: {
      start: Date
      end: Date
    }
    searchQuery?: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Props['modelValue']): void
  (e: 'search', query: string): void
}>()

const { t } = useI18n()

// Local state
const searchQuery = ref(props.modelValue.searchQuery || '')
const showDateRange = ref(false)
const customStartDate = ref('')
const customEndDate = ref('')
const selectedDatePreset = ref<string | null>(null)

// Filter options
const statusOptions = computed(() => [
  { value: 'ALL', label: t('orders.status.all') },
  { value: 'PENDING', label: t('orders.status.pending') },
  { value: 'CONFIRMED', label: t('orders.status.confirmed') },
  { value: 'PREPARING', label: t('orders.status.preparing') },
  { value: 'READY', label: t('orders.status.ready') },
  { value: 'SERVED', label: t('orders.status.served') },
  { value: 'CANCELLED', label: t('orders.status.cancelled') }
])

const orderTypeOptions = computed(() => [
  {
    value: 'ALL',
    label: t('orders.orderType.all'),
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    value: 'DINE_IN',
    label: t('orders.orderType.dine_in'),
    icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7'
  },
  {
    value: 'TAKEAWAY',
    label: t('orders.orderType.takeaway'),
    icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
  },
  {
    value: 'DELIVERY',
    label: t('orders.orderType.delivery'),
    icon: 'M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z'
  }
])

const dateRangePresets = computed(() => [
  { value: 'today', label: t('orders.dateRange.today') },
  { value: 'week', label: t('orders.dateRange.thisWeek') },
  { value: 'month', label: t('orders.dateRange.thisMonth') },
  { value: 'all', label: t('orders.dateRange.allTime') }
])

// Computed
const hasActiveFilters = computed(() => {
  return (
    (props.modelValue.status && props.modelValue.status !== 'ALL') ||
    (props.modelValue.orderType && props.modelValue.orderType !== 'ALL') ||
    props.modelValue.dateRange ||
    (searchQuery.value && searchQuery.value.trim() !== '')
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (props.modelValue.status && props.modelValue.status !== 'ALL') count++
  if (props.modelValue.orderType && props.modelValue.orderType !== 'ALL') count++
  if (props.modelValue.dateRange) count++
  if (searchQuery.value && searchQuery.value.trim() !== '') count++
  return count
})

// Methods
function selectStatus(status: OrderStatus | 'ALL') {
  emit('update:modelValue', {
    ...props.modelValue,
    status
  })
}

function selectOrderType(orderType: OrderType | 'ALL') {
  emit('update:modelValue', {
    ...props.modelValue,
    orderType
  })
}

function selectDateRange(preset: string) {
  selectedDatePreset.value = preset

  if (preset === 'all') {
    emit('update:modelValue', {
      ...props.modelValue,
      dateRange: undefined
    })
    return
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let start: Date
  const end = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today

  switch (preset) {
    case 'today':
      start = today
      break
    case 'week':
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      return
  }

  emit('update:modelValue', {
    ...props.modelValue,
    dateRange: { start, end }
  })
}

function applyCustomDateRange() {
  if (customStartDate.value && customEndDate.value) {
    selectedDatePreset.value = null

    const start = new Date(customStartDate.value)
    const end = new Date(customEndDate.value)
    end.setHours(23, 59, 59, 999) // End of day

    emit('update:modelValue', {
      ...props.modelValue,
      dateRange: { start, end }
    })
  }
}

function clearSearch() {
  searchQuery.value = ''
  emit('search', '')
}

function clearAllFilters() {
  searchQuery.value = ''
  customStartDate.value = ''
  customEndDate.value = ''
  selectedDatePreset.value = null

  emit('update:modelValue', {
    status: 'ALL',
    orderType: 'ALL',
    dateRange: undefined,
    searchQuery: ''
  })
  emit('search', '')
}

function getStatusChipClass(status: string): string {
  const isSelected = props.modelValue.status === status
  if (isSelected) {
    return 'bg-primary-600 text-white shadow-md'
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
}

function getOrderTypeChipClass(orderType: string): string {
  const isSelected = props.modelValue.orderType === orderType
  if (isSelected) {
    return 'bg-primary-600 text-white shadow-md'
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
}

function getDateRangeChipClass(preset: string): string {
  const isSelected = selectedDatePreset.value === preset
  if (isSelected) {
    return 'bg-primary-600 text-white shadow-md'
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
