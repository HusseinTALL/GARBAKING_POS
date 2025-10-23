<!--
  Customer Selection Modal Component
  Simple modal for selecting customers for orders in the POS system
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
              Select Customer
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

          <!-- Customer Search -->
          <div class="mb-4">
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

          <!-- Search Results -->
          <div class="min-h-64 max-h-64 overflow-y-auto">
            <div v-if="searchResults.length > 0" class="space-y-2">
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
                <div v-if="customer.loyaltyPoints" class="text-sm text-blue-600">
                  {{ customer.loyaltyPoints || 0 }} points
                </div>
              </div>
            </div>

            <div v-else-if="searchQuery && !searchLoading" class="text-center py-8 text-gray-500">
              No customers found matching "{{ searchQuery }}"
            </div>

            <div v-else-if="!searchQuery" class="text-center py-8 text-gray-500">
              Enter a search term to find customers
            </div>

            <div v-if="searchLoading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div class="mt-2 text-sm text-gray-600">Searching...</div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div class="text-sm text-red-600">{{ error }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="selectGuestCustomer"
            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Continue as Guest
          </button>
          <button
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from 'lodash-es'

export interface Customer {
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
  'customer-selected': [customer: Customer | null]
}>()

// State
const searchQuery = ref('')
const searchResults = ref<Customer[]>([])
const searchLoading = ref(false)
const error = ref('')

// Methods
const handleSearch = debounce(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searchLoading.value = true
  error.value = ''

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Mock search results - replace with actual API call
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
      },
      {
        id: '4',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah@example.com',
        phone: '+1987654321',
        loyaltyPoints: 320
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
    error.value = err instanceof Error ? err.message : 'Search failed'
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}, 300)

const selectCustomer = (customer: Customer) => {
  emit('customer-selected', customer)
}

const selectGuestCustomer = () => {
  emit('customer-selected', null)
}

const closeModal = () => {
  emit('close')
}
</script>