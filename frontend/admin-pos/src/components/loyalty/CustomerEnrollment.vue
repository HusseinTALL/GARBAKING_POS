<!--
  Customer Enrollment Component - Enroll customers in loyalty program
  Handles signup, points display, and quick actions
-->

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Customer Enrollment</h2>
        <p class="text-sm text-gray-600 mt-1">Enroll customers in the loyalty program</p>
      </div>
      <button
        @click="showBulkEnroll = true"
        class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Bulk Enroll
      </button>
    </div>

    <!-- Search/Enroll Form -->
    <div class="p-6">
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Search or Add Customer</label>
        <div class="flex space-x-3">
          <input
            v-model="searchQuery"
            @input="searchCustomers"
            type="text"
            placeholder="Search by name, email, or phone..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            @click="showEnrollForm = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <UserPlus class="w-4 h-4" />
            <span>New Enrollment</span>
          </button>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="space-y-2 mb-6">
        <div
          v-for="customer in searchResults"
          :key="customer.id"
          class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors flex items-center justify-between"
          @click="selectCustomer(customer)"
        >
          <div>
            <div class="font-medium text-gray-900">{{ customer.name }}</div>
            <div class="text-sm text-gray-600">{{ customer.email }} • {{ customer.phone }}</div>
          </div>
          <div class="text-right">
            <div v-if="customer.isEnrolled" class="flex items-center space-x-2">
              <span class="text-sm font-medium text-green-600">Enrolled</span>
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {{ customer.points || 0 }} pts
              </span>
            </div>
            <button
              v-else
              @click.stop="quickEnroll(customer)"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>

      <!-- Selected Customer Info -->
      <div v-if="selectedCustomer && selectedCustomer.isEnrolled" class="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {{ getInitials(selectedCustomer.name) }}
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ selectedCustomer.name }}</h3>
              <p class="text-sm text-gray-600">{{ selectedCustomer.email }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span class="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                  {{ selectedCustomer.tier || 'Bronze' }}
                </span>
                <span class="text-xs text-gray-600">
                  Member since {{ formatDate(selectedCustomer.enrolledAt) }}
                </span>
              </div>
            </div>
          </div>
          <button
            @click="selectedCustomer = null"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="bg-white rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ selectedCustomer.points || 0 }}</div>
            <div class="text-sm text-gray-600">Points</div>
          </div>
          <div class="bg-white rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ formatCurrency(selectedCustomer.totalSpent || 0) }}</div>
            <div class="text-sm text-gray-600">Total Spent</div>
          </div>
          <div class="bg-white rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-purple-600">{{ selectedCustomer.visitCount || 0 }}</div>
            <div class="text-sm text-gray-600">Visits</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center space-x-3">
          <button
            @click="showAwardPoints = true"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Award Points
          </button>
          <button
            @click="showAdjustPoints = true"
            class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Adjust Points
          </button>
          <button
            @click="viewHistory"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            View History
          </button>
        </div>
      </div>
    </div>

    <!-- Enroll Form Modal -->
    <div v-if="showEnrollForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showEnrollForm = false">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" @click.stop>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Enroll New Customer</h3>

          <form @submit.prevent="handleEnroll" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                v-model="enrollForm.name"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                v-model="enrollForm.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input
                v-model="enrollForm.phone"
                type="tel"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex items-center space-x-3 pt-4">
              <button
                type="button"
                @click="showEnrollForm = false"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isEnrolling"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {{ isEnrolling ? 'Enrolling...' : 'Enroll' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Award Points Modal -->
    <div v-if="showAwardPoints" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showAwardPoints = false">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" @click.stop>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Award Points</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Points to Award *</label>
              <input
                v-model.number="pointsForm.points"
                type="number"
                min="1"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
              <textarea
                v-model="pointsForm.reason"
                rows="3"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div class="flex items-center space-x-3">
              <button
                @click="showAwardPoints = false"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                @click="confirmAwardPoints"
                :disabled="!pointsForm.points || !pointsForm.reason"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Award Points
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLoyaltyStore } from '@/stores/loyalty'
import { UserPlus, X } from 'lucide-vue-next'

const loyaltyStore = useLoyaltyStore()

// State
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedCustomer = ref<any>(null)
const showEnrollForm = ref(false)
const showBulkEnroll = ref(false)
const showAwardPoints = ref(false)
const showAdjustPoints = ref(false)
const isEnrolling = ref(false)

const enrollForm = ref({
  name: '',
  email: '',
  phone: ''
})

const pointsForm = ref({
  points: 0,
  reason: ''
})

// Methods
const searchCustomers = () => {
  // Mock search - replace with actual API call
  if (searchQuery.value.length > 2) {
    searchResults.value = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        isEnrolled: false
      }
    ]
  } else {
    searchResults.value = []
  }
}

const selectCustomer = (customer: any) => {
  selectedCustomer.value = customer
  searchResults.value = []
  searchQuery.value = ''
}

const quickEnroll = async (customer: any) => {
  const result = await loyaltyStore.enrollCustomer({
    customerId: customer.id,
    customerName: customer.name,
    email: customer.email,
    phone: customer.phone
  })

  if (result) {
    customer.isEnrolled = true
    customer.points = loyaltyStore.defaultProgram?.signupBonus || 0
  }
}

const handleEnroll = async () => {
  isEnrolling.value = true
  const result = await loyaltyStore.enrollCustomer({
    customerId: 'new-' + Date.now(),
    customerName: enrollForm.value.name,
    email: enrollForm.value.email,
    phone: enrollForm.value.phone
  })

  if (result) {
    showEnrollForm.value = false
    enrollForm.value = { name: '', email: '', phone: '' }
    selectedCustomer.value = result
  }

  isEnrolling.value = false
}

const confirmAwardPoints = async () => {
  if (!selectedCustomer.value) return

  await loyaltyStore.awardPoints(
    selectedCustomer.value.customerId,
    pointsForm.value.points,
    pointsForm.value.reason
  )

  showAwardPoints.value = false
  pointsForm.value = { points: 0, reason: '' }
}

const viewHistory = () => {
  // Navigate to history view
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`
}
</script>
