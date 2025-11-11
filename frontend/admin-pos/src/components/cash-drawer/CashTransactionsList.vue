<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DollarSign, TrendingUp, TrendingDown, Minus, Plus, RefreshCw } from 'lucide-vue-next'
import { cashDrawerApi } from '@/services/api-spring'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  sessionId: number | null
}>()

const toast = useToast()
const transactions = ref<any[]>([])
const isLoading = ref(false)
const filterType = ref<string>('ALL')

const transactionTypes = [
  { value: 'ALL', label: 'All Transactions' },
  { value: 'STARTING_FLOAT', label: 'Starting Float' },
  { value: 'SALE', label: 'Sales' },
  { value: 'REFUND', label: 'Refunds' },
  { value: 'DROP', label: 'Drops' },
  { value: 'PAYOUT', label: 'Payouts' },
  { value: 'NO_SALE', label: 'No Sale' }
]

const filteredTransactions = computed(() => {
  if (filterType.value === 'ALL') return transactions.value
  return transactions.value.filter(t => t.type === filterType.value)
})

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'SALE': return TrendingUp
    case 'REFUND': return TrendingDown
    case 'DROP': return TrendingDown
    case 'PAYOUT': return Minus
    case 'NO_SALE': return RefreshCw
    default: return DollarSign
  }
}

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'SALE': return 'text-green-400'
    case 'REFUND': return 'text-red-400'
    case 'DROP': return 'text-blue-400'
    case 'PAYOUT': return 'text-yellow-400'
    case 'NO_SALE': return 'text-gray-400'
    default: return 'text-gray-400'
  }
}

const getAmountColor = (type: string) => {
  switch (type) {
    case 'SALE':
    case 'STARTING_FLOAT':
      return 'text-green-400'
    case 'REFUND':
    case 'DROP':
    case 'PAYOUT':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

const formatAmount = (amount: number, type: string) => {
  const prefix = (type === 'SALE' || type === 'STARTING_FLOAT') ? '+' : ''
  return `${prefix}$${Math.abs(amount).toFixed(2)}`
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const fetchTransactions = async () => {
  if (!props.sessionId) {
    transactions.value = []
    return
  }

  isLoading.value = true
  try {
    transactions.value = await cashDrawerApi.getSessionTransactions(props.sessionId)
  } catch (error: any) {
    console.error('Failed to fetch transactions:', error)
    toast.error('Failed to load transactions')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTransactions()
})

defineExpose({ refresh: fetchTransactions })
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-white">Cash Transactions</h3>
      <button
        @click="fetchTransactions"
        :disabled="!sessionId || isLoading"
        class="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
      >
        <RefreshCw :size="20" :class="{ 'animate-spin': isLoading }" />
      </button>
    </div>

    <!-- Filter -->
    <div class="mb-4">
      <select
        v-model="filterType"
        class="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="type in transactionTypes" :key="type.value" :value="type.value">
          {{ type.label }}
        </option>
      </select>
    </div>

    <!-- Empty State -->
    <div v-if="!sessionId" class="text-center py-8">
      <DollarSign :size="48" class="mx-auto text-gray-600 mb-4" />
      <p class="text-gray-400">Open a cash drawer session to view transactions</p>
    </div>

    <div v-else-if="filteredTransactions.length === 0" class="text-center py-8">
      <DollarSign :size="48" class="mx-auto text-gray-600 mb-4" />
      <p class="text-gray-400">
        {{ filterType === 'ALL' ? 'No transactions yet' : `No ${filterType.toLowerCase()} transactions` }}
      </p>
    </div>

    <!-- Transactions List -->
    <div v-else class="space-y-2 max-h-96 overflow-y-auto">
      <div
        v-for="transaction in filteredTransactions"
        :key="transaction.id"
        class="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-3 flex-1">
            <component
              :is="getTransactionIcon(transaction.type)"
              :size="20"
              :class="getTransactionColor(transaction.type)"
              class="mt-1"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-white font-medium">
                  {{ transaction.type.replace('_', ' ') }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ formatTime(transaction.createdAt) }}
                </span>
              </div>
              <p v-if="transaction.referenceNumber" class="text-sm text-gray-400 mt-1">
                Ref: {{ transaction.referenceNumber }}
              </p>
              <p v-if="transaction.notes" class="text-sm text-gray-300 mt-1">
                {{ transaction.notes }}
              </p>
            </div>
          </div>
          <span :class="['text-lg font-bold font-mono', getAmountColor(transaction.type)]">
            {{ formatAmount(transaction.amount, transaction.type) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="filteredTransactions.length > 0" class="mt-4 pt-4 border-t border-gray-700">
      <div class="flex justify-between text-sm">
        <span class="text-gray-400">Total Transactions:</span>
        <span class="text-white font-medium">{{ filteredTransactions.length }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for transaction list */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
</style>
