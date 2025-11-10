<!--
  Campaign Modal Component
  Creates promotional campaigns for loyalty rewards
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
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              Create Loyalty Campaign
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
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Campaign Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Summer Double Points"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Type *
                </label>
                <select
                  v-model="form.type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DOUBLE_POINTS">Double Points</option>
                  <option value="BONUS_POINTS">Bonus Points</option>
                  <option value="PERCENTAGE_BONUS">Percentage Bonus</option>
                  <option value="SPEND_THRESHOLD">Spend Threshold Bonus</option>
                  <option value="BIRTHDAY_SPECIAL">Birthday Special</option>
                  <option value="REFERRAL_BONUS">Referral Campaign</option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the campaign benefits and terms..."
              ></textarea>
            </div>

            <!-- Campaign Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Points/Bonus Value -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ getBonusLabel() }} *
                </label>
                <div class="relative">
                  <input
                    v-model.number="form.bonusValue"
                    type="number"
                    min="1"
                    step="1"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    :placeholder="getBonusPlaceholder()"
                  />
                  <span v-if="form.type === 'PERCENTAGE_BONUS'" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                    %
                  </span>
                  <span v-else-if="form.type === 'SPEND_THRESHOLD'" class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    $
                  </span>
                </div>
              </div>

              <!-- Minimum Spend (for certain types) -->
              <div v-if="needsMinSpend()">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Spend *
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                  <input
                    v-model.number="form.minSpend"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  v-model="form.startDate"
                  type="date"
                  required
                  :min="new Date().toISOString().split('T')[0]"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  v-model="form.endDate"
                  type="date"
                  required
                  :min="form.startDate || new Date().toISOString().split('T')[0]"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Target Customers -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Target Customers
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="form.targetAllCustomers"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-900">All customers</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.targetNewCustomers"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-900">New customers only</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.targetTiers"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-900">Specific tiers only</span>
                </label>
              </div>
            </div>

            <!-- Usage Limits -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Max Uses Per Customer
                </label>
                <input
                  v-model.number="form.maxUsesPerCustomer"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Unlimited"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Total Campaign Budget
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                  <input
                    v-model.number="form.totalBudget"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Terms and Conditions
              </label>
              <textarea
                v-model="form.terms"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter detailed terms and conditions for this campaign..."
              ></textarea>
            </div>

            <!-- Auto-activate -->
            <div>
              <label class="flex items-center">
                <input
                  v-model="form.autoActivate"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-900">Activate campaign immediately upon creation</span>
              </label>
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
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
            <span v-else>Create Campaign</span>
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
import { loyaltyService } from '@/services/loyalty'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'created': [campaignId: string]
}>()

// State
const isSubmitting = ref(false)
const error = ref('')

const form = ref({
  name: '',
  type: 'DOUBLE_POINTS',
  description: '',
  bonusValue: 2,
  minSpend: 0,
  startDate: '',
  endDate: '',
  targetAllCustomers: true,
  targetNewCustomers: false,
  targetTiers: false,
  maxUsesPerCustomer: null as number | null,
  totalBudget: null as number | null,
  terms: '',
  autoActivate: true
})

// Computed
const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 &&
         form.value.bonusValue > 0 &&
         form.value.startDate &&
         form.value.endDate &&
         new Date(form.value.endDate) > new Date(form.value.startDate)
})

// Methods
const getBonusLabel = () => {
  const labels = {
    'DOUBLE_POINTS': 'Point Multiplier',
    'BONUS_POINTS': 'Bonus Points',
    'PERCENTAGE_BONUS': 'Bonus Percentage',
    'SPEND_THRESHOLD': 'Spending Threshold',
    'BIRTHDAY_SPECIAL': 'Birthday Bonus Points',
    'REFERRAL_BONUS': 'Referral Bonus Points'
  }
  return labels[form.value.type as keyof typeof labels] || 'Bonus Value'
}

const getBonusPlaceholder = () => {
  const placeholders = {
    'DOUBLE_POINTS': '2 (for double points)',
    'BONUS_POINTS': '100',
    'PERCENTAGE_BONUS': '25',
    'SPEND_THRESHOLD': '50.00',
    'BIRTHDAY_SPECIAL': '500',
    'REFERRAL_BONUS': '200'
  }
  return placeholders[form.value.type as keyof typeof placeholders] || '100'
}

const needsMinSpend = () => {
  return ['BONUS_POINTS', 'PERCENTAGE_BONUS', 'SPEND_THRESHOLD'].includes(form.value.type)
}

const closeModal = () => {
  if (!isSubmitting.value) {
    emit('close')
    resetForm()
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    type: 'DOUBLE_POINTS',
    description: '',
    bonusValue: 2,
    minSpend: 0,
    startDate: '',
    endDate: '',
    targetAllCustomers: true,
    targetNewCustomers: false,
    targetTiers: false,
    maxUsesPerCustomer: null,
    totalBudget: null,
    terms: '',
    autoActivate: true
  }
  error.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  error.value = ''
  isSubmitting.value = true

  try {
    const campaignData = {
      name: form.value.name,
      type: form.value.type,
      description: form.value.description,
      bonusValue: form.value.bonusValue,
      minSpend: needsMinSpend() ? form.value.minSpend : undefined,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      targeting: {
        allCustomers: form.value.targetAllCustomers,
        newCustomers: form.value.targetNewCustomers,
        specificTiers: form.value.targetTiers
      },
      limits: {
        maxUsesPerCustomer: form.value.maxUsesPerCustomer,
        totalBudget: form.value.totalBudget
      },
      terms: form.value.terms,
      isActive: form.value.autoActivate
    }

    const campaign = await loyaltyService.createCampaign(campaignData)

    emit('created', campaign.id)
    emit('close')
    resetForm()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create campaign'
  } finally {
    isSubmitting.value = false
  }
}
</script>
