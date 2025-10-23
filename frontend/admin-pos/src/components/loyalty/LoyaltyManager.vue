<!--
  Loyalty Manager Component
  Main container component that manages customer loyalty operations
-->

<template>
  <div class="space-y-6">
    <!-- Customer Search -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Customer Loyalty</h2>

      <!-- Customer Selection -->
      <div class="flex space-x-4 mb-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Search Customer
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name, email, or phone..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              @input="handleSearch"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg v-if="searchLoading" class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div class="flex items-end">
          <button
            @click="showCreateCustomer = true"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            New Customer
          </button>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="mb-4">
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="customer in searchResults"
            :key="customer.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
            @click="selectCustomer(customer)"
          >
            <div>
              <div class="font-medium text-gray-900">
                {{ customer.firstName }} {{ customer.lastName }}
              </div>
              <div class="text-sm text-gray-600">
                {{ customer.email || customer.phone }}
              </div>
            </div>
            <div class="text-sm text-blue-600">
              {{ customer.loyaltyPoints || 0 }} points
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="searchQuery && !searchLoading" class="text-center py-4 text-gray-500">
        No customers found matching "{{ searchQuery }}"
      </div>
    </div>

    <!-- Selected Customer Loyalty Profile -->
    <CustomerLoyaltyCard
      v-if="selectedCustomer"
      :loyalty-profile="loyaltyProfile"
      :loading="loyaltyLoading"
      :error="loyaltyError"
      @redeem-points="showRedemptionModal = true"
      @view-history="showHistoryModal = true"
      @enroll-customer="showEnrollmentModal = true"
      @retry="loadCustomerLoyalty"
    />

    <!-- Recent Activity -->
    <div v-if="selectedCustomer && loyaltyProfile" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          @click="awardBonusPoints"
          class="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">Award Bonus Points</div>
              <div class="text-xs text-gray-600">Give manual bonus points</div>
            </div>
          </div>
        </button>

        <button
          @click="showRedemptionModal = true"
          :disabled="!loyaltyProfile.customer.loyaltyPoints || loyaltyProfile.customer.loyaltyPoints < 100"
          class="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">Redeem Points</div>
              <div class="text-xs text-gray-600">Convert points to discounts</div>
            </div>
          </div>
        </button>

        <button
          @click="showHistoryModal = true"
          class="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">View History</div>
              <div class="text-xs text-gray-600">See all activity</div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <PointsRedemptionModal
      :is-open="showRedemptionModal"
      :customer-profile="loyaltyProfile"
      :order-id="currentOrderId"
      :min-points-redeem="currentProgram?.minPointsRedeem || 100"
      :max-points-per-order="currentProgram?.maxPointsPerOrder"
      :dollar-per-point="currentProgram?.dollarPerPoint || 0.01"
      @close="showRedemptionModal = false"
      @redeem="handlePointsRedemption"
    />

    <CustomerEnrollmentModal
      :is-open="showEnrollmentModal"
      :customer="selectedCustomer"
      @close="showEnrollmentModal = false"
      @enrolled="handleCustomerEnrolled"
    />

    <LoyaltyHistoryModal
      :is-open="showHistoryModal"
      :customer="selectedCustomer"
      @close="showHistoryModal = false"
    />

    <!-- Success/Error Messages -->
    <div v-if="message" class="fixed bottom-4 right-4 z-50">
      <div
        :class="[
          'p-4 rounded-md shadow-lg',
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        ]"
      >
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { debounce } from 'lodash-es'
import CustomerLoyaltyCard from './CustomerLoyaltyCard.vue'
import PointsRedemptionModal from './PointsRedemptionModal.vue'
import CustomerEnrollmentModal from './CustomerEnrollmentModal.vue'
import LoyaltyHistoryModal from './LoyaltyHistoryModal.vue'
import { loyaltyService } from '@/services/loyalty'
import type { CustomerLoyaltyProfile, RedemptionRequest, LoyaltyProgram } from '@/services/loyalty'

interface Customer {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  loyaltyPoints?: number
}

interface Props {
  orderId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  orderId: null
})

// State
const searchQuery = ref('')
const searchResults = ref<Customer[]>([])
const selectedCustomer = ref<Customer | null>(null)
const loyaltyProfile = ref<CustomerLoyaltyProfile | null>(null)
const currentProgram = ref<LoyaltyProgram | null>(null)

// Loading states
const searchLoading = ref(false)
const loyaltyLoading = ref(false)

// Modal states
const showRedemptionModal = ref(false)
const showEnrollmentModal = ref(false)
const showHistoryModal = ref(false)
const showCreateCustomer = ref(false)

// Error states
const loyaltyError = ref<string | null>(null)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

// Computed
const currentOrderId = computed(() => props.orderId)

// Methods
const handleSearch = debounce(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searchLoading.value = true
  try {
    // Note: This would be replaced with actual customer search API
    // For now, we'll simulate with a mock search
    await new Promise(resolve => setTimeout(resolve, 300))

    // Mock search results - replace with actual API call
    searchResults.value = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        loyaltyPoints: 150
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        loyaltyPoints: 250
      }
    ].filter(customer =>
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}, 300)

const selectCustomer = (customer: Customer) => {
  selectedCustomer.value = customer
  searchResults.value = []
  searchQuery.value = `${customer.firstName} ${customer.lastName}`
  loadCustomerLoyalty()
}

const loadCustomerLoyalty = async () => {
  if (!selectedCustomer.value) return

  loyaltyLoading.value = true
  loyaltyError.value = null

  try {
    const response = await loyaltyService.getCustomerLoyalty(selectedCustomer.value.id)
    if (response.success) {
      loyaltyProfile.value = response.data

      // Load current program details if customer is enrolled
      if (loyaltyProfile.value?.customer.tier) {
        const programsResponse = await loyaltyService.getAllPrograms()
        if (programsResponse.success) {
          currentProgram.value = programsResponse.data.find(p =>
            p.tiers?.some(t => t.id === loyaltyProfile.value?.customer.tier?.id)
          ) || null
        }
      }
    } else {
      loyaltyError.value = response.message || 'Failed to load loyalty profile'
      loyaltyProfile.value = null
    }
  } catch (error) {
    loyaltyError.value = error instanceof Error ? error.message : 'Failed to load loyalty profile'
    loyaltyProfile.value = null
  } finally {
    loyaltyLoading.value = false
  }
}

const handlePointsRedemption = async (redemption: RedemptionRequest & { applyToOrder: boolean }) => {
  if (!selectedCustomer.value) return

  try {
    const response = await loyaltyService.redeemPoints(selectedCustomer.value.id, redemption)
    if (response.success) {
      showMessage('Points redeemed successfully!', 'success')
      showRedemptionModal.value = false

      // Apply to order if requested
      if (redemption.applyToOrder && props.orderId) {
        await loyaltyService.applyRedemptionToOrder(
          props.orderId,
          response.data.redemption.id,
          selectedCustomer.value.id
        )
      }

      // Reload loyalty profile
      await loadCustomerLoyalty()
    } else {
      showMessage(response.message || 'Failed to redeem points', 'error')
    }
  } catch (error) {
    showMessage(error instanceof Error ? error.message : 'Failed to redeem points', 'error')
  }
}

const handleCustomerEnrolled = async (programId: string) => {
  showMessage('Customer enrolled successfully!', 'success')
  await loadCustomerLoyalty()
}

const awardBonusPoints = async () => {
  if (!selectedCustomer.value) return

  const points = prompt('Enter bonus points to award:')
  if (!points || isNaN(Number(points)) || Number(points) <= 0) return

  const reason = prompt('Reason for bonus points:') || 'Manual bonus points'

  try {
    // Note: This would need to be implemented in the backend API
    // For now, we'll simulate success
    showMessage(`Awarded ${points} bonus points!`, 'success')
    await loadCustomerLoyalty()
  } catch (error) {
    showMessage('Failed to award bonus points', 'error')
  }
}

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = null
  }, 5000)
}

// Watch for order changes
watch(() => props.orderId, (newOrderId) => {
  // Could auto-load customer from order if needed
})
</script>