<!--
  Checkout Loyalty Integration - Points earning and redemption at checkout
  Integrates with order processing
-->

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-gray-900">Loyalty Points</h3>
      <button
        v-if="!showLoyaltyOptions"
        @click="showLoyaltyOptions = true"
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Apply Points
      </button>
    </div>

    <!-- Customer Lookup -->
    <div v-if="!customer" class="mb-4">
      <input
        v-model="searchQuery"
        @input="searchCustomer"
        type="text"
        placeholder="Enter phone or email..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      />
      <div v-if="searchResults.length > 0" class="mt-2 max-h-40 overflow-auto border border-gray-200 rounded-lg">
        <button
          v-for="result in searchResults"
          :key="result.id"
          @click="selectCustomer(result)"
          class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
        >
          <div class="font-medium">{{ result.name }}</div>
          <div class="text-gray-600">{{ result.points }} points available</div>
        </button>
      </div>
    </div>

    <!-- Customer Info -->
    <div v-if="customer" class="space-y-3">
      <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div>
          <div class="font-medium text-gray-900">{{ customer.name }}</div>
          <div class="text-sm text-gray-600">{{ customer.points }} points available</div>
        </div>
        <button
          @click="customer = null; pointsToRedeem = 0"
          class="text-gray-400 hover:text-gray-600"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Points to Earn -->
      <div v-if="orderTotal" class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
        <div class="text-sm">
          <div class="font-medium text-green-900">Points to Earn</div>
          <div class="text-green-700">{{ pointsToEarn }} points on this order</div>
        </div>
        <div class="text-lg font-bold text-green-600">+{{ pointsToEarn }}</div>
      </div>

      <!-- Points Redemption -->
      <div v-if="showLoyaltyOptions" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Redeem Points (Available: {{ customer.points }})
          </label>
          <div class="flex items-center space-x-2">
            <input
              v-model.number="pointsToRedeem"
              type="number"
              :min="minRedeemPoints"
              :max="customer.points"
              :step="minRedeemPoints"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Enter points"
            />
            <button
              @click="pointsToRedeem = customer.points"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              Max
            </button>
          </div>
        </div>

        <div v-if="pointsToRedeem > 0" class="p-3 bg-purple-50 rounded-lg">
          <div class="flex items-center justify-between text-sm">
            <span class="text-purple-900">Discount Value:</span>
            <span class="text-lg font-bold text-purple-600">-{{ formatCurrency(discountValue) }}</span>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="applyPointsRedemption"
            :disabled="!canRedeem"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Apply Discount
          </button>
          <button
            v-if="appliedPoints > 0"
            @click="removePointsRedemption"
            class="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
          >
            Remove
          </button>
        </div>
      </div>

      <!-- Applied Discount Summary -->
      <div v-if="appliedPoints > 0 && !showLoyaltyOptions" class="p-3 bg-green-50 rounded-lg border border-green-200">
        <div class="flex items-center justify-between">
          <div class="text-sm">
            <div class="font-medium text-green-900">{{ appliedPoints }} Points Applied</div>
            <div class="text-green-700">Discount: -{{ formatCurrency(appliedDiscount) }}</div>
          </div>
          <button
            @click="showLoyaltyOptions = true"
            class="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Edit
          </button>
        </div>
      </div>

      <!-- Tier Progress -->
      <div v-if="customer.tier" class="p-3 bg-gray-50 rounded-lg">
        <div class="text-xs text-gray-600 mb-1">Current Tier: {{ customer.tier }}</div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full"
            :style="{ width: `${tierProgress}%` }"
          ></div>
        </div>
        <div class="text-xs text-gray-600 mt-1">{{ formatCurrency(customer.totalSpent || 0)} / {{ formatCurrency(nextTierThreshold) }} to next tier</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLoyaltyStore } from '@/stores/loyalty'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  orderTotal: number
  customerId?: string
}>()

const emit = defineEmits<{
  (e: 'points-applied', data: { points: number, discount: number }): void
  (e: 'points-removed'): void
  (e: 'customer-selected', customerId: string): void
}>()

const loyaltyStore = useLoyaltyStore()

// State
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const customer = ref<any>(null)
const showLoyaltyOptions = ref(false)
const pointsToRedeem = ref(0)
const appliedPoints = ref(0)
const appliedDiscount = ref(0)

// Computed
const pointsToEarn = computed(() => {
  return loyaltyStore.calculatePointsForOrder(props.orderTotal)
})

const discountValue = computed(() => {
  return loyaltyStore.calculateDiscountFromPoints(pointsToRedeem.value)
})

const minRedeemPoints = computed(() => {
  return loyaltyStore.defaultProgram?.minPointsRedeem || 100
})

const canRedeem = computed(() => {
  return pointsToRedeem.value >= minRedeemPoints.value &&
         pointsToRedeem.value <= (customer.value?.points || 0) &&
         discountValue.value <= props.orderTotal
})

const tierProgress = computed(() => {
  if (!customer.value) return 0
  const spent = customer.value.totalSpent || 0
  return Math.min((spent / nextTierThreshold.value) * 100, 100)
})

const nextTierThreshold = computed(() => {
  // This would be calculated based on actual tier thresholds
  return 10000 // FCFA
})

// Methods
const searchCustomer = async () => {
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    return
  }

  // Mock search - replace with actual API
  searchResults.value = [
    {
      id: '1',
      name: 'Customer Name',
      points: 500,
      tier: 'Silver',
      totalSpent: 5000
    }
  ]
}

const selectCustomer = (result: any) => {
  customer.value = result
  searchResults.value = []
  searchQuery.value = ''
  emit('customer-selected', result.id)
}

const applyPointsRedemption = () => {
  if (!canRedeem.value) return

  appliedPoints.value = pointsToRedeem.value
  appliedDiscount.value = discountValue.value

  emit('points-applied', {
    points: appliedPoints.value,
    discount: appliedDiscount.value
  })

  showLoyaltyOptions.value = false
}

const removePointsRedemption = () => {
  appliedPoints.value = 0
  appliedDiscount.value = 0
  pointsToRedeem.value = 0
  showLoyaltyOptions.value = false

  emit('points-removed')
}

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}

// Watch for external customer ID changes
watch(() => props.customerId, async (newId) => {
  if (newId && !customer.value) {
    const customerData = await loyaltyStore.getCustomerDetails(newId)
    if (customerData) {
      customer.value = customerData
    }
  }
})

// Export method for order completion
defineExpose({
  async processOrderCompletion(orderId: string) {
    if (!customer.value) return

    // Award points for purchase
    await loyaltyStore.awardPoints(
      customer.value.customerId,
      pointsToEarn.value,
      `Purchase - Order #${orderId}`,
      orderId
    )

    // Process redemption if applied
    if (appliedPoints.value > 0) {
      await loyaltyStore.redeemPoints(
        customer.value.customerId,
        appliedPoints.value,
        orderId
      )
    }
  }
})
</script>
