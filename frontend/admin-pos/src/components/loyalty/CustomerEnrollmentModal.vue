<!--
  Customer Enrollment Modal Component
  Allows enrolling customers in the loyalty program
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
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              Enroll in Loyalty Program
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

          <!-- Loading State -->
          <div v-if="loadingPrograms" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div class="mt-2 text-sm text-gray-600">Loading programs...</div>
          </div>

          <!-- Content -->
          <div v-else-if="programs.length" class="space-y-4">
            <!-- Customer Info -->
            <div v-if="customer" class="p-4 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-900">{{ customer.firstName }} {{ customer.lastName }}</div>
              <div class="text-xs text-gray-600">{{ customer.email || customer.phone }}</div>
            </div>

            <!-- Program Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Loyalty Program
              </label>
              <select
                v-model="selectedProgramId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a program...</option>
                <option v-for="program in programs" :key="program.id" :value="program.id">
                  {{ program.name }}
                </option>
              </select>
            </div>

            <!-- Program Details -->
            <div v-if="selectedProgram" class="space-y-4">
              <div class="border border-gray-200 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">{{ selectedProgram.name }}</h4>
                <p v-if="selectedProgram.description" class="text-sm text-gray-600 mb-3">
                  {{ selectedProgram.description }}
                </p>

                <!-- Program Benefits -->
                <div class="space-y-2">
                  <div class="flex items-center text-sm">
                    <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Earn {{ selectedProgram.pointsPerDollar }} point{{ selectedProgram.pointsPerDollar !== 1 ? 's' : '' }} per $1 spent</span>
                  </div>

                  <div v-if="selectedProgram.signupBonus > 0" class="flex items-center text-sm">
                    <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Get {{ selectedProgram.signupBonus }} bonus points for joining</span>
                  </div>

                  <div v-if="selectedProgram.birthdayBonus > 0" class="flex items-center text-sm">
                    <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Receive {{ selectedProgram.birthdayBonus }} birthday bonus points</span>
                  </div>

                  <div class="flex items-center text-sm">
                    <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Redeem points starting at {{ selectedProgram.minPointsRedeem }} points</span>
                  </div>

                  <div class="flex items-center text-sm">
                    <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Each point worth ${{ selectedProgram.dollarPerPoint.toFixed(2) }}</span>
                  </div>
                </div>

                <!-- Tier Information -->
                <div v-if="selectedProgram.tiers?.length" class="mt-4">
                  <h5 class="text-sm font-medium text-gray-900 mb-2">Membership Tiers</h5>
                  <div class="space-y-2">
                    <div
                      v-for="tier in selectedProgram.tiers.slice(0, 3)"
                      :key="tier.id"
                      class="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                    >
                      <div class="flex items-center">
                        <div
                          class="w-3 h-3 rounded-full mr-2"
                          :style="{ backgroundColor: tier.color || '#6B7280' }"
                        ></div>
                        <span class="font-medium">{{ tier.name }}</span>
                      </div>
                      <span class="text-gray-600">
                        ${{ tier.minSpent.toLocaleString() }}+ spent
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
              <div class="text-sm text-red-600">{{ error }}</div>
            </div>
          </div>

          <!-- No Programs State -->
          <div v-else-if="!loadingPrograms" class="text-center py-8">
            <div class="text-gray-500 mb-2">No active loyalty programs found</div>
            <div class="text-sm text-gray-400">Contact an administrator to set up loyalty programs</div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="programs.length" class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="handleEnroll"
            :disabled="!selectedProgramId || isSubmitting"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enrolling...
            </span>
            <span v-else>Enroll Customer</span>
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
import { ref, computed, watch, onMounted } from 'vue'
import type { LoyaltyProgram } from '@/services/loyalty'
import { loyaltyService } from '@/services/loyalty'

interface Customer {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

interface Props {
  isOpen: boolean
  customer: Customer | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'enrolled': [programId: string]
}>()

// State
const programs = ref<LoyaltyProgram[]>([])
const selectedProgramId = ref('')
const loadingPrograms = ref(false)
const isSubmitting = ref(false)
const error = ref('')

// Computed
const selectedProgram = computed(() => {
  return programs.value.find(p => p.id === selectedProgramId.value)
})

// Watch for modal open
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadPrograms()
    selectedProgramId.value = ''
    error.value = ''
  }
})

// Methods
const loadPrograms = async () => {
  loadingPrograms.value = true
  error.value = ''

  try {
    const programsList = await loyaltyService.getAllPrograms()
    programs.value = programsList.filter(p => p.isActive)
    // Auto-select first program if only one
    if (programs.value.length === 1) {
      selectedProgramId.value = programs.value[0].id
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load programs'
  } finally {
    loadingPrograms.value = false
  }
}

const closeModal = () => {
  if (!isSubmitting.value) {
    emit('close')
  }
}

const handleEnroll = async () => {
  if (!props.customer || !selectedProgramId.value || isSubmitting.value) return

  error.value = ''
  isSubmitting.value = true

  try {
    await loyaltyService.enrollCustomer(props.customer.id, selectedProgramId.value)
    emit('enrolled', selectedProgramId.value)
    emit('close')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to enroll customer'
  } finally {
    isSubmitting.value = false
  }
}
</script>