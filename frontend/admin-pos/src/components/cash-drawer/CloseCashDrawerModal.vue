<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { cashDrawerApi } from '@/services/api-spring'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  sessionId: number
  userId: number
  expectedCash: number
}>()

const emit = defineEmits(['close', 'success'])
const toast = useToast()

const manualAmount = ref<number>(0)
const notes = ref<string>('')
const isLoading = ref(false)

// US currency denominations
const denominations = ref({
  '100.00': 0,
  '50.00': 0,
  '20.00': 0,
  '10.00': 0,
  '5.00': 0,
  '1.00': 0,
  '0.25': 0,
  '0.10': 0,
  '0.05': 0,
  '0.01': 0
})

const totalFromDenominations = computed(() => {
  return Object.entries(denominations.value)
    .reduce((sum, [value, count]) => sum + (parseFloat(value) * count), 0)
})

const countedCash = computed(() => {
  return totalFromDenominations.value > 0 ? totalFromDenominations.value : manualAmount.value
})

const variance = computed(() => {
  return countedCash.value - props.expectedCash
})

const varianceStatus = computed(() => {
  if (Math.abs(variance.value) < 0.01) return 'BALANCED'
  if (variance.value < 0) return 'SHORT'
  return 'OVER'
})

const varianceColor = computed(() => {
  const status = varianceStatus.value
  if (status === 'BALANCED') return 'text-green-400'
  if (status === 'SHORT') return 'text-red-400'
  return 'text-yellow-400'
})

const varianceIcon = computed(() => {
  const status = varianceStatus.value
  if (status === 'BALANCED') return CheckCircle
  if (status === 'SHORT') return AlertCircle
  return AlertTriangle
})

const handleSubmit = async () => {
  if (countedCash.value <= 0) {
    toast.error('Please count the cash in the drawer')
    return
  }

  if (Math.abs(variance.value) > 10 && !notes.value.trim()) {
    toast.error('Please provide notes for large variance')
    return
  }

  isLoading.value = true
  try {
    const counts = totalFromDenominations.value > 0 ? denominations.value : undefined

    await cashDrawerApi.closeSession(props.sessionId, {
      userId: props.userId,
      countedCash: countedCash.value,
      denominationCounts: counts,
      notes: notes.value.trim() || undefined
    })

    toast.success('Cash drawer closed successfully')
    emit('success')
  } catch (error: any) {
    console.error('Failed to close drawer:', error)
    toast.error(error.response?.data?.message || 'Failed to close cash drawer')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Close Cash Drawer</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-white transition-colors">
          <X :size="24" />
        </button>
      </div>

      <div class="space-y-6">
        <!-- Expected Cash Display -->
        <div class="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="text-blue-400 font-medium">Expected Cash:</span>
            <span class="text-2xl font-bold text-blue-400">
              ${{ expectedCash.toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Manual amount input -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Counted Cash Amount (Quick Entry)
          </label>
          <input
            v-model.number="manualAmount"
            type="number"
            step="0.01"
            min="0"
            class="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-800 text-gray-400">Or count denominations</span>
          </div>
        </div>

        <!-- Denomination counter -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-3">
            Count Bills and Coins
          </label>
          <div class="grid grid-cols-2 gap-3">
            <!-- Bills -->
            <div class="space-y-2">
              <p class="text-xs text-gray-400 font-medium mb-2">BILLS</p>
              <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span class="text-green-400 font-mono font-semibold w-16">$100.00</span>
                <input v-model.number="denominations['100.00']" type="number" min="0"
                  class="w-20 bg-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span class="text-gray-400 font-mono text-sm ml-auto">
                  = ${{ (100 * denominations['100.00']).toFixed(2) }}
                </span>
              </div>
              <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span class="text-green-400 font-mono font-semibold w-16">$50.00</span>
                <input v-model.number="denominations['50.00']" type="number" min="0"
                  class="w-20 bg-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span class="text-gray-400 font-mono text-sm ml-auto">
                  = ${{ (50 * denominations['50.00']).toFixed(2) }}
                </span>
              </div>
              <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span class="text-green-400 font-mono font-semibold w-16">$20.00</span>
                <input v-model.number="denominations['20.00']" type="number" min="0"
                  class="w-20 bg-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span class="text-gray-400 font-mono text-sm ml-auto">
                  = ${{ (20 * denominations['20.00']).toFixed(2) }}
                </span>
              </div>
              <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span class="text-green-400 font-mono font-semibold w-16">$10.00</span>
                <input v-model.number="denominations['10.00']" type="number" min="0"
                  class="w-20 bg-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span class="text-gray-400 font-mono text-sm ml-auto">
                  = ${{ (10 * denominations['10.00']).toFixed(2) }}
                </span>
              </div>
              <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span class="text-green-400 font-mono font-semibold w-16">$5.00</span>
                <input v-model.number="denominations['5.00']" type="number" min="0"
                  class="w-20 bg-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span class="text-gray-400 font-mono text-sm ml-auto">
                  = ${{ (5 * denominations['5.00']).toFixed(2) }}
                </span>
              </div>
              <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span class="text-green-400 font-mono font-semibold w-16">$1.00</span>
                <input v-model.number="denominations['1.00']" type="number" min="0"
                  class="w-20 bg-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span class="text-gray-400 font-mono text-sm ml-auto">
                  = ${{ (1 * denominations['1.00']).toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Coins -->
            <div class="space-y-2">
              <p class="text-xs text-gray-400 font-medium mb-2">COINS</p>
              <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span class="text-yellow-400 font-mono font-semibold w-16">$0.25</span>
                <input v-model.number="denominations['0.25']" type="number" min="0"
                  class="w-20 bg-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span class="text-gray-400 font-mono text-sm ml-auto">
                  = ${{ (0.25 * denominations['0.25']).toFixed(2) }}
                </span>
              </div>
              <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span class="text-yellow-400 font-mono font-semibold w-16">$0.10</span>
                <input v-model.number="denominations['0.10']" type="number" min="0"
                  class="w-20 bg-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span class="text-gray-400 font-mono text-sm ml-auto">
                  = ${{ (0.10 * denominations['0.10']).toFixed(2) }}
                </span>
              </div>
              <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span class="text-yellow-400 font-mono font-semibold w-16">$0.05</span>
                <input v-model.number="denominations['0.05']" type="number" min="0"
                  class="w-20 bg-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span class="text-gray-400 font-mono text-sm ml-auto">
                  = ${{ (0.05 * denominations['0.05']).toFixed(2) }}
                </span>
              </div>
              <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <span class="text-yellow-400 font-mono font-semibold w-16">$0.01</span>
                <input v-model.number="denominations['0.01']" type="number" min="0"
                  class="w-20 bg-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span class="text-gray-400 font-mono text-sm ml-auto">
                  = ${{ (0.01 * denominations['0.01']).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Counted Cash Display -->
        <div class="bg-purple-900 bg-opacity-30 border border-purple-500 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="text-purple-400 font-medium">Counted Cash:</span>
            <span class="text-3xl font-bold text-purple-400">
              ${{ countedCash.toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Variance Display -->
        <div :class="[
          'rounded-lg p-4 border-2',
          varianceStatus === 'BALANCED' ? 'bg-green-900 bg-opacity-30 border-green-500' : '',
          varianceStatus === 'SHORT' ? 'bg-red-900 bg-opacity-30 border-red-500' : '',
          varianceStatus === 'OVER' ? 'bg-yellow-900 bg-opacity-30 border-yellow-500' : ''
        ]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <component :is="varianceIcon" :size="24" :class="varianceColor" />
              <span :class="['font-medium', varianceColor]">
                Variance ({{ varianceStatus }}):
              </span>
            </div>
            <span :class="['text-3xl font-bold', varianceColor]">
              {{ variance >= 0 ? '+' : '' }}${{ variance.toFixed(2) }}
            </span>
          </div>
          <p v-if="varianceStatus === 'BALANCED'" class="text-sm text-green-400 mt-2">
            Perfect! Cash matches expected amount.
          </p>
          <p v-else-if="varianceStatus === 'SHORT'" class="text-sm text-red-400 mt-2">
            Cash shortage detected. Please verify count and add notes below.
          </p>
          <p v-else class="text-sm text-yellow-400 mt-2">
            Cash overage detected. Please verify count and add notes below.
          </p>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Notes {{ Math.abs(variance) > 10 ? '(Required for large variance)' : '(Optional)' }}
          </label>
          <textarea
            v-model="notes"
            rows="3"
            class="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add notes about this shift, variance reasons, or any issues..."
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <button
            @click="emit('close')"
            :disabled="isLoading"
            class="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 text-white px-4 py-3 rounded font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="isLoading || countedCash <= 0 || (Math.abs(variance) > 10 && !notes.trim())"
            class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-700 disabled:opacity-50 text-white px-4 py-3 rounded font-medium transition-colors"
          >
            {{ isLoading ? 'Closing...' : 'Close Drawer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
