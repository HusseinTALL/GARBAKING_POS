<!--
  Payment processing interface for POS transactions
  Handles multiple payment methods, cash drawer, and receipts
-->

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900 text-gray-100">
    <!-- Header -->
    <div class="flex-none bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Cash Drawer Management
          </h1>
          <div class="flex items-center space-x-2">
            <div :class="[
              'w-3 h-3 rounded-full',
              isSessionOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            ]"></div>
            <span class="text-sm text-gray-400">
              {{ isSessionOpen ? 'Drawer Open' : 'Drawer Closed' }}
            </span>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <button
            @click="refreshAllData"
            :disabled="isLoading"
            class="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden p-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <!-- Left: Cash Drawer Panel -->
        <div class="flex flex-col">
          <CashDrawerPanel
            ref="cashDrawerPanelRef"
            :drawer-id="currentDrawerId"
            :user-id="currentUserId"
            @session-opened="handleSessionOpened"
            @session-closed="handleSessionClosed"
            @transaction-recorded="handleTransactionRecorded"
          />
        </div>

        <!-- Right: Transaction History -->
        <div class="flex flex-col">
          <CashTransactionsList
            ref="transactionsListRef"
            :session-id="currentSessionId"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RotateCw } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { cashDrawerApi } from '@/services/api-spring'
import { useToast } from 'vue-toastification'
import CashDrawerPanel from '@/components/cash-drawer/CashDrawerPanel.vue'
import CashTransactionsList from '@/components/cash-drawer/CashTransactionsList.vue'

const toast = useToast()
const authStore = useAuthStore()

// Component refs
const cashDrawerPanelRef = ref<InstanceType<typeof CashDrawerPanel> | null>(null)
const transactionsListRef = ref<InstanceType<typeof CashTransactionsList> | null>(null)

// State
const isLoading = ref(false)
const currentDrawerId = ref<number>(1) // TODO: Get from user's terminal/location
const currentSessionId = ref<number | null>(null)
const currentSession = ref<any>(null)

// Computed
const currentUserId = computed(() => authStore.user?.id || 1)
const isSessionOpen = computed(() => currentSession.value?.status === 'OPEN')

// Methods
const loadCurrentSession = async () => {
  try {
    currentSession.value = await cashDrawerApi.getCurrentSession(currentDrawerId.value)
    currentSessionId.value = currentSession.value?.id || null
  } catch (error: any) {
    if (error.response?.status === 404 || error.response?.status === 500) {
      // No active session
      currentSession.value = null
      currentSessionId.value = null
    } else {
      console.error('Failed to load session:', error)
    }
  }
}

const handleSessionOpened = async () => {
  toast.success('Cash drawer session opened successfully')
  await loadCurrentSession()
  // Refresh transaction list
  if (transactionsListRef.value) {
    transactionsListRef.value.refresh()
  }
}

const handleSessionClosed = async () => {
  toast.success('Cash drawer session closed successfully')
  currentSession.value = null
  currentSessionId.value = null
  // Refresh transaction list
  if (transactionsListRef.value) {
    transactionsListRef.value.refresh()
  }
}

const handleTransactionRecorded = async () => {
  // Refresh both panel and transaction list
  if (cashDrawerPanelRef.value) {
    await cashDrawerPanelRef.value.refresh()
  }
  if (transactionsListRef.value) {
    await transactionsListRef.value.refresh()
  }
}

const refreshAllData = async () => {
  isLoading.value = true
  try {
    await loadCurrentSession()
    if (cashDrawerPanelRef.value) {
      await cashDrawerPanelRef.value.refresh()
    }
    if (transactionsListRef.value) {
      await transactionsListRef.value.refresh()
    }
    toast.success('Data refreshed')
  } catch (error) {
    console.error('Failed to refresh data:', error)
    toast.error('Failed to refresh data')
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadCurrentSession()

  // Auto-refresh every 30 seconds
  setInterval(() => {
    if (!isLoading.value && isSessionOpen.value) {
      loadCurrentSession()
    }
  }, 30000)
})
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
