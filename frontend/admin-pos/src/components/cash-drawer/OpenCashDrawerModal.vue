<script setup lang="ts">
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { cashDrawerApi } from '@/services/api-spring'
import { useToast } from 'vue-toastification'

const props = defineProps<{
  drawerId: number
  userId: number
}>()

const emit = defineEmits(['close', 'success'])
const toast = useToast()

const manualAmount = ref<number>(0)
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

const finalAmount = computed(() => {
  return totalFromDenominations.value > 0 ? totalFromDenominations.value : manualAmount.value
})

const handleSubmit = async () => {
  if (finalAmount.value <= 0) {
    toast.error('Please enter a starting cash amount')
    return
  }

  isLoading.value = true
  try {
    const counts = totalFromDenominations.value > 0 ? denominations.value : undefined

    await cashDrawerApi.openSession(props.drawerId, {
      userId: props.userId,
      startingCash: finalAmount.value,
      denominationCounts: counts
    })

    toast.success('Cash drawer opened successfully')
    emit('success')
  } catch (error: any) {
    console.error('Failed to open drawer:', error)
    toast.error(error.response?.data?.message || 'Failed to open cash drawer')
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
        <h2 class="text-2xl font-bold text-white">Open Cash Drawer</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-white transition-colors">
          <X :size="24" />
        </button>
      </div>

      <div class="space-y-6">
        <!-- Manual amount input -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Starting Cash Amount (Quick Entry)
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

        <!-- Total Display -->
        <div class="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="text-green-400 font-medium">Starting Cash Total:</span>
            <span class="text-3xl font-bold text-green-400">
              ${{ finalAmount.toFixed(2) }}
            </span>
          </div>
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
            :disabled="isLoading || finalAmount <= 0"
            class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-700 disabled:opacity-50 text-white px-4 py-3 rounded font-medium transition-colors"
          >
            {{ isLoading ? 'Opening...' : 'Open Drawer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
