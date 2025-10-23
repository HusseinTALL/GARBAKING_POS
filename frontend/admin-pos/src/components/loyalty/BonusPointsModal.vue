<!--
  Bonus Points Modal Component
  Allows staff to award manual bonus points to customers
-->

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="closeModal"
      ></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              Award Bonus Points
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Customer Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Customer
              </label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search customer by name, email, or phone..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  @input="handleSearch"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg v-if="searchLoading" class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>

              <!-- Search Results -->
              <div v-if="searchResults.length > 0" class="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                <div
                  v-for="customer in searchResults"
                  :key="customer.id"
                  class="p-3 hover:bg-gray-50 cursor-pointer"
                  @click="selectCustomer(customer)"
                >
                  <div class="font-medium text-gray-900">
                    {{ customer.firstName }} {{ customer.lastName }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ customer.email || customer.phone }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Selected Customer -->
            <div v-if="selectedCustomer" class="p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900">
                    {{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ selectedCustomer.email || selectedCustomer.phone }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-blue-600 font-medium">
                    {{ selectedCustomer.loyaltyPoints || 0 }} pts
                  </div>
                  <div class="text-xs text-gray-600">Current Balance</div>
                </div>
              </div>
            </div>

            <!-- Bonus Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bonus Type
              </label>
              <select
                v-model="form.bonusType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="SIGNUP_BONUS">Signup Bonus</option>
                <option value="BIRTHDAY_BONUS">Birthday Bonus</option>
                <option value="CAMPAIGN_BONUS">Campaign Bonus</option>
                <option value="TIER_BONUS">Tier Upgrade Bonus</option>
                <option value="REFERRAL_BONUS">Referral Bonus</option>
                <option value="MANUAL_BONUS">Manual Bonus</option>
              </select>
            </div>

            <!-- Points Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Points to Award
              </label>
              <input
                v-model.number="form.points"
                type="number"
                min="1"
                max="10000"
                step="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter points amount"
              />
              <div class="mt-1 text-sm text-gray-600">
                Minimum: 1 point • Maximum: 10,000 points
              </div>
            </div>

            <!-- Reason -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                v-model="form.reason"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter reason for awarding bonus points..."
                maxlength="255"
              ></textarea>
              <div class="mt-1 text-sm text-gray-600">
                {{ form.reason.length }}/255 characters
              </div>
            </div>

            <!-- Expiration (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                v-model="form.expiresAt"
                type="date"
                :min="new Date().toISOString().split('T')[0]"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div class="mt-1 text-sm text-gray-600">
                Leave empty for non-expiring points
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
              <div class="text-sm text-red-600">{{ error }}</div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="handleSubmit"
            :disabled="!isFormValid || isSubmitting"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Awarding...
            </span>
            <span v-else>Award Points</span>
          </button>
          <button
            @click="closeModal"
            :disabled="isSubmitting"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { debounce } from 'lodash-es'
import { loyaltyService } from '@/services/loyalty'

interface Customer {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  loyaltyPoints?: number
}

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'awarded': [customerId: string, points: number]
}>()

// State
const searchQuery = ref('')
const searchResults = ref<Customer[]>([])
const selectedCustomer = ref<Customer | null>(null)
const searchLoading = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const form = ref({
  bonusType: 'MANUAL_BONUS',
  points: 100,
  reason: '',
  expiresAt: ''
})

// Computed
const isFormValid = computed(() => {
  return selectedCustomer.value &&
         form.value.points > 0 &&
         form.value.points <= 10000 &&
         form.value.reason.trim().length > 0
})

// Methods
const handleSearch = debounce(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searchLoading.value = true
  try {
    // Mock customer search - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 300))

    const mockCustomers: Customer[] = [
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
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '+1234567890',
        loyaltyPoints: 75
      }
    ]

    searchResults.value = mockCustomers.filter(customer => {
      const query = searchQuery.value.toLowerCase()
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase()
      return fullName.includes(query) ||
             customer.email?.toLowerCase().includes(query) ||
             customer.phone?.includes(query)
    })
  } catch (err) {
    console.error('Search error:', err)
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}, 300)

const selectCustomer = (customer: Customer) => {
  selectedCustomer.value = customer
  searchQuery.value = `${customer.firstName} ${customer.lastName}`
  searchResults.value = []
}

const closeModal = () => {
  if (!isSubmitting.value) {
    emit('close')
    resetForm()
  }
}

const resetForm = () => {
  searchQuery.value = ''
  searchResults.value = []
  selectedCustomer.value = null
  form.value = {
    bonusType: 'MANUAL_BONUS',
    points: 100,
    reason: '',
    expiresAt: ''
  }
  error.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  error.value = ''
  isSubmitting.value = true

  try {
    const awardRequest = {
      points: form.value.points,
      type: form.value.bonusType,
      reason: form.value.reason,
      expiresAt: form.value.expiresAt || undefined
    }

    const response = await loyaltyService.awardPoints(selectedCustomer.value!.id, awardRequest)

    if (response.success) {
      emit('awarded', selectedCustomer.value!.id, form.value.points)
      emit('close')
      resetForm()
    } else {
      error.value = response.message || 'Failed to award bonus points'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to award bonus points'
  } finally {
    isSubmitting.value = false
  }
}
</script>