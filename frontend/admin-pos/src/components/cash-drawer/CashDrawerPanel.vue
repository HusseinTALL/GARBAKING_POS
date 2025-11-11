<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DollarSign, TrendingUp, TrendingDown, Minus, Plus, LogOut, LogIn } from 'lucide-vue-next'
import { cashDrawerApi } from '@/services/api-spring'
import { useToast } from 'vue-toastification'
import OpenCashDrawerModal from './OpenCashDrawerModal.vue'
import CloseCashDrawerModal from './CloseCashDrawerModal.vue'

const props = defineProps<{
  drawerId: number
  userId: number
}>()

const emit = defineEmits(['session-opened', 'session-closed', 'transaction-recorded'])

const toast = useToast()
const currentSession = ref<any>(null)
const currentBalance = ref<any>(null)
const sessionStats = ref<any>(null)
const isLoading = ref(false)
const showOpenModal = ref(false)
const showCloseModal = ref(false)
const showDropModal = ref(false)
const showPayoutModal = ref(false)

// Drop/Payout form
const dropAmount = ref<number>(0)
const payoutAmount = ref<number>(0)
const payoutNotes = ref<string>('')

const isSessionOpen = computed(() => currentSession.value?.status === 'OPEN')
const expectedCash = computed(() => currentBalance.value?.currentBalance || 0)

const fetchCurrentSession = async () => {
  isLoading.value = true
  try {
    currentSession.value = await cashDrawerApi.getCurrentSession(props.drawerId)

    // Fetch balance and stats if session is open
    if (currentSession.value) {
      const [balance, stats] = await Promise.all([
        cashDrawerApi.getCurrentBalance(currentSession.value.id),
        cashDrawerApi.getSessionStatistics(currentSession.value.id)
      ])
      currentBalance.value = balance
      sessionStats.value = stats
    }
  } catch (error: any) {
    if (error.response?.status === 404 || error.response?.status === 500) {
      // No active session
      currentSession.value = null
      currentBalance.value = null
      sessionStats.value = null
    } else {
      console.error('Failed to fetch session:', error)
    }
  } finally {
    isLoading.value = false
  }
}

const handleSessionOpened = async () => {
  showOpenModal.value = false
  await fetchCurrentSession()
  emit('session-opened')
}

const handleSessionClosed = async () => {
  showCloseModal.value = false
  currentSession.value = null
  currentBalance.value = null
  sessionStats.value = null
  emit('session-closed')
}

const handleDrop = async () => {
  if (dropAmount.value <= 0) {
    toast.error('Drop amount must be greater than zero')
    return
  }

  try {
    await cashDrawerApi.recordCashDrop(currentSession.value.id, {
      amount: dropAmount.value,
      userId: props.userId,
      notes: `Cash drop to safe`
    })

    toast.success(`Cash drop of $${dropAmount.value.toFixed(2)} recorded`)
    dropAmount.value = 0
    showDropModal.value = false
    await fetchCurrentSession()
    emit('transaction-recorded')
  } catch (error: any) {
    console.error('Failed to record drop:', error)
    toast.error(error.response?.data?.message || 'Failed to record cash drop')
  }
}

const handlePayout = async () => {
  if (payoutAmount.value <= 0) {
    toast.error('Payout amount must be greater than zero')
    return
  }

  if (!payoutNotes.value.trim()) {
    toast.error('Payout notes are required')
    return
  }

  try {
    await cashDrawerApi.recordCashPayout(currentSession.value.id, {
      amount: payoutAmount.value,
      userId: props.userId,
      notes: payoutNotes.value.trim()
    })

    toast.success(`Payout of $${payoutAmount.value.toFixed(2)} recorded`)
    payoutAmount.value = 0
    payoutNotes.value = ''
    showPayoutModal.value = false
    await fetchCurrentSession()
    emit('transaction-recorded')
  } catch (error: any) {
    console.error('Failed to record payout:', error)
    toast.error(error.response?.data?.message || 'Failed to record payout')
  }
}

const handleNoSale = async () => {
  try {
    await cashDrawerApi.recordNoSale(currentSession.value.id, props.userId)
    toast.success('No-sale recorded (drawer opened for change)')
    await fetchCurrentSession()
    emit('transaction-recorded')
  } catch (error: any) {
    console.error('Failed to record no-sale:', error)
    toast.error(error.response?.data?.message || 'Failed to record no-sale')
  }
}

onMounted(() => {
  fetchCurrentSession()
})

defineExpose({ refresh: fetchCurrentSession })
</script>

<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-white">Cash Drawer Status</h3>
      <span :class="[
        'px-3 py-1 rounded-full text-sm font-medium',
        isSessionOpen ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'
      ]">
        {{ isSessionOpen ? 'OPEN' : 'CLOSED' }}
      </span>
    </div>

    <!-- Session Closed State -->
    <div v-if="!isSessionOpen" class="text-center py-8">
      <DollarSign :size="48" class="mx-auto text-gray-600 mb-4" />
      <p class="text-gray-400 mb-6">No active cash drawer session</p>
      <button
        @click="showOpenModal = true"
        class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
      >
        <LogIn :size="20" />
        Open Cash Drawer
      </button>
    </div>

    <!-- Session Open State -->
    <div v-else class="space-y-6">
      <!-- Current Balance -->
      <div class="bg-gradient-to-r from-green-900 to-green-800 bg-opacity-30 border border-green-500 rounded-lg p-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-green-400 text-sm font-medium mb-1">Current Cash Balance</p>
            <p class="text-4xl font-bold text-green-400">
              ${{ expectedCash.toFixed(2) }}
            </p>
          </div>
          <DollarSign :size="48" class="text-green-400 opacity-50" />
        </div>
      </div>

      <!-- Session Info Grid -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-gray-400 text-xs mb-1">Starting Cash</p>
          <p class="text-white font-bold text-lg">
            ${{ currentSession.startingCash?.toFixed(2) || '0.00' }}
          </p>
        </div>
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-gray-400 text-xs mb-1">Transactions</p>
          <p class="text-white font-bold text-lg">
            {{ sessionStats?.transactionCount || 0 }}
          </p>
        </div>
        <div class="bg-gray-700 rounded-lg p-4">
          <p class="text-gray-400 text-xs mb-1">Sales</p>
          <p class="text-white font-bold text-lg">
            {{ sessionStats?.saleCount || 0 }}
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-3">
        <p class="text-gray-300 font-medium text-sm">Quick Actions</p>

        <div class="grid grid-cols-2 gap-3">
          <!-- Cash Drop -->
          <button
            @click="showDropModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <TrendingDown :size="18" />
            Cash Drop
          </button>

          <!-- Cash Payout -->
          <button
            @click="showPayoutModal = true"
            class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Minus :size="18" />
            Payout
          </button>

          <!-- No Sale -->
          <button
            @click="handleNoSale"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus :size="18" />
            No Sale
          </button>

          <!-- Close Drawer -->
          <button
            @click="showCloseModal = true"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut :size="18" />
            Close Drawer
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <OpenCashDrawerModal
      v-if="showOpenModal"
      :drawer-id="drawerId"
      :user-id="userId"
      @close="showOpenModal = false"
      @success="handleSessionOpened"
    />

    <CloseCashDrawerModal
      v-if="showCloseModal && currentSession"
      :session-id="currentSession.id"
      :user-id="userId"
      :expected-cash="expectedCash"
      @close="showCloseModal = false"
      @success="handleSessionClosed"
    />

    <!-- Cash Drop Modal -->
    <div v-if="showDropModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">Cash Drop to Safe</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Amount</label>
            <input
              v-model.number="dropAmount"
              type="number"
              step="0.01"
              min="0"
              class="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="showDropModal = false"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              @click="handleDrop"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Record Drop
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Payout Modal -->
    <div v-if="showPayoutModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">Cash Payout</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Amount</label>
            <input
              v-model.number="payoutAmount"
              type="number"
              step="0.01"
              min="0"
              class="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Reason (Required)</label>
            <textarea
              v-model="payoutNotes"
              rows="3"
              class="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., Vendor payment, Petty cash, etc."
            ></textarea>
          </div>
          <div class="flex gap-3">
            <button
              @click="showPayoutModal = false"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              @click="handlePayout"
              :disabled="!payoutNotes.trim() || payoutAmount <= 0"
              class="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded"
            >
              Record Payout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
