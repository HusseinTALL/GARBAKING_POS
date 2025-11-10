<!--
  Program Creation Modal Component
  Modal for creating new loyalty programs with tiers and settings
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
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              Create New Loyalty Program
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

          <form @submit.prevent="createProgram">
            <!-- Basic Information -->
            <div class="mb-6">
              <h4 class="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., VIP Rewards"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Program Type</label>
                  <select
                    v-model="form.type"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="points">Points-Based</option>
                    <option value="tier">Tier-Based</option>
                    <option value="cashback">Cashback</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the benefits and features of this program..."
                ></textarea>
              </div>
            </div>

            <!-- Point System -->
            <div class="mb-6">
              <h4 class="text-md font-semibold text-gray-900 mb-4">Point System</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Points per Dollar *</label>
                  <input
                    v-model.number="form.pointsPerDollar"
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Min Points to Redeem</label>
                  <input
                    v-model.number="form.minPointsRedeem"
                    type="number"
                    min="1"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Point Value (cents)</label>
                  <input
                    v-model.number="form.pointValue"
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <!-- Bonus Points -->
            <div class="mb-6">
              <h4 class="text-md font-semibold text-gray-900 mb-4">Bonus Points</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Signup Bonus</label>
                  <input
                    v-model.number="form.signupBonus"
                    type="number"
                    min="0"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Birthday Bonus</label>
                  <input
                    v-model.number="form.birthdayBonus"
                    type="number"
                    min="0"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Referral Bonus</label>
                  <input
                    v-model.number="form.referralBonus"
                    type="number"
                    min="0"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <!-- Membership Tiers -->
            <div class="mb-6" v-if="form.type === 'tier' || form.type === 'hybrid'">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-md font-semibold text-gray-900">Membership Tiers</h4>
                <button
                  type="button"
                  @click="addTier"
                  class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Add Tier
                </button>
              </div>

              <div class="space-y-4">
                <div
                  v-for="(tier, index) in form.tiers"
                  :key="index"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h5 class="font-medium text-gray-900">Tier {{ index + 1 }}</h5>
                    <button
                      v-if="form.tiers.length > 1"
                      type="button"
                      @click="removeTier(index)"
                      class="text-red-600 hover:text-red-800"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Name</label>
                      <input
                        v-model="tier.name"
                        type="text"
                        required
                        class="block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="e.g., Bronze"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Min Spend ($)</label>
                      <input
                        v-model.number="tier.minSpent"
                        type="number"
                        min="0"
                        required
                        class="block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Point Multiplier</label>
                      <input
                        v-model.number="tier.pointMultiplier"
                        type="number"
                        min="1"
                        step="0.1"
                        required
                        class="block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Color</label>
                      <input
                        v-model="tier.color"
                        type="color"
                        class="block w-full h-8 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div class="mt-3">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Benefits</label>
                    <textarea
                      v-model="tier.benefits"
                      rows="2"
                      class="block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Describe the benefits of this tier..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Program Settings -->
            <div class="mb-6">
              <h4 class="text-md font-semibold text-gray-900 mb-4">Settings</h4>
              <div class="space-y-3">
                <label class="flex items-center">
                  <input
                    v-model="form.autoEnroll"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Auto-enroll new customers</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.isActive"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Activate program immediately</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.allowPointsTransfer"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-900">Allow points transfer between customers</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="createProgram"
            :disabled="!isFormValid || isCreating"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
          >
            {{ isCreating ? 'Creating...' : 'Create Program' }}
          </button>
          <button
            @click="closeModal"
            :disabled="isCreating"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:bg-gray-400"
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

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'created': [programId: string]
}>()

// State
const isCreating = ref(false)

const form = ref({
  name: '',
  type: 'points',
  description: '',
  pointsPerDollar: 1,
  minPointsRedeem: 100,
  pointValue: 1.0,
  signupBonus: 100,
  birthdayBonus: 50,
  referralBonus: 200,
  autoEnroll: true,
  isActive: true,
  allowPointsTransfer: false,
  tiers: [
    {
      name: 'Bronze',
      minSpent: 0,
      pointMultiplier: 1,
      color: '#CD7F32',
      benefits: 'Basic member benefits'
    }
  ]
})

// Computed
const isFormValid = computed(() => {
  return form.value.name.trim() !== '' &&
         form.value.pointsPerDollar > 0 &&
         form.value.tiers.every(tier => tier.name.trim() !== '' && tier.minSpent >= 0)
})

// Methods
const closeModal = () => {
  if (!isCreating.value) {
    resetForm()
    emit('close')
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    type: 'points',
    description: '',
    pointsPerDollar: 1,
    minPointsRedeem: 100,
    pointValue: 1.0,
    signupBonus: 100,
    birthdayBonus: 50,
    referralBonus: 200,
    autoEnroll: true,
    isActive: true,
    allowPointsTransfer: false,
    tiers: [
      {
        name: 'Bronze',
        minSpent: 0,
        pointMultiplier: 1,
        color: '#CD7F32',
        benefits: 'Basic member benefits'
      }
    ]
  }
}

const addTier = () => {
  const nextTierNumber = form.value.tiers.length + 1
  const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
  const tierColors = ['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2', '#B9F2FF']

  form.value.tiers.push({
    name: tierNames[nextTierNumber - 1] || `Tier ${nextTierNumber}`,
    minSpent: form.value.tiers[form.value.tiers.length - 1].minSpent + 500,
    pointMultiplier: 1 + (nextTierNumber - 1) * 0.5,
    color: tierColors[nextTierNumber - 1] || '#6B7280',
    benefits: `Tier ${nextTierNumber} member benefits`
  })
}

const removeTier = (index: number) => {
  if (form.value.tiers.length > 1) {
    form.value.tiers.splice(index, 1)
  }
}

const createProgram = async () => {
  if (!isFormValid.value || isCreating.value) return

  isCreating.value = true

  try {
    // Call API to create program
    console.log('Creating program:', form.value)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    const programId = 'new-program-' + Date.now()
    emit('created', programId)
    closeModal()

  } catch (error) {
    alert('Failed to create program. Please try again.')
  } finally {
    isCreating.value = false
  }
}
</script>
