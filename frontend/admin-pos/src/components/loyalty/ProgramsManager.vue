<!--
  Programs Manager Component
  Manages loyalty programs, tiers, and program settings
-->

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Loyalty Programs</h2>
          <p class="text-sm text-gray-600 mt-1">Create and manage loyalty programs and membership tiers</p>
        </div>
        <button
          @click="showCreateProgram = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Create Program
        </button>
      </div>
    </div>

    <!-- Programs List -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="program in programs"
        :key="program.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- Program Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold text-gray-900">{{ program.name }}</h3>
            <div class="flex items-center space-x-2">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  program.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ program.isActive ? 'Active' : 'Inactive' }}
              </span>
              <button
                @click="editProgram(program)"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="text-sm text-gray-600">{{ program.description }}</p>
        </div>

        <!-- Program Details -->
        <div class="p-6">
          <div class="space-y-4">
            <!-- Key Metrics -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-2xl font-bold text-blue-600">{{ program.memberCount || 0 }}</div>
                <div class="text-xs text-gray-600">Members</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-600">{{ program.pointsPerDollar }}x</div>
                <div class="text-xs text-gray-600">Points per $1</div>
              </div>
            </div>

            <!-- Program Features -->
            <div class="space-y-2">
              <div class="flex items-center text-sm">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ program.pointsPerDollar }} point{{ program.pointsPerDollar !== 1 ? 's' : '' }} per $1</span>
              </div>

              <div v-if="program.signupBonus > 0" class="flex items-center text-sm">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ program.signupBonus }} signup bonus</span>
              </div>

              <div v-if="program.birthdayBonus > 0" class="flex items-center text-sm">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ program.birthdayBonus }} birthday bonus</span>
              </div>

              <div class="flex items-center text-sm">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span>Redeem from {{ program.minPointsRedeem }} points</span>
              </div>
            </div>

            <!-- Membership Tiers -->
            <div v-if="program.tiers && program.tiers.length > 0">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Membership Tiers</h4>
              <div class="space-y-1">
                <div
                  v-for="tier in program.tiers.slice(0, 3)"
                  :key="tier.id"
                  class="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                >
                  <div class="flex items-center">
                    <div
                      class="w-2 h-2 rounded-full mr-2"
                      :style="{ backgroundColor: tier.color || '#6B7280' }"
                    ></div>
                    <span class="font-medium">{{ tier.name }}</span>
                  </div>
                  <span class="text-gray-600">
                    ${{ tier.minSpent.toLocaleString() }}+
                  </span>
                </div>
                <div v-if="program.tiers.length > 3" class="text-xs text-gray-500 text-center">
                  +{{ program.tiers.length - 3 }} more tiers
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Program Actions -->
        <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <div class="flex space-x-2">
              <button
                @click="toggleProgramStatus(program)"
                :class="[
                  'px-3 py-1 text-xs font-medium rounded-md',
                  program.isActive
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                ]"
              >
                {{ program.isActive ? 'Deactivate' : 'Activate' }}
              </button>
              <button
                @click="viewProgramDetails(program)"
                class="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                View Details
              </button>
            </div>
            <div class="text-xs text-gray-500">
              Created {{ formatDate(program.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Add Program Card -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 overflow-hidden">
        <div class="p-6 text-center">
          <div class="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Create New Program</h3>
          <p class="text-sm text-gray-600 mb-4">Set up a new loyalty program with custom rewards and tiers</p>
          <button
            @click="showCreateProgram = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>

    <!-- Program Statistics -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Program Performance</h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ totalMembers.toLocaleString() }}</div>
          <div class="text-sm text-gray-600">Total Members</div>
          <div class="text-xs text-green-600 mt-1">+12% this month</div>
        </div>

        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ totalPointsIssued.toLocaleString() }}</div>
          <div class="text-sm text-gray-600">Points Issued</div>
          <div class="text-xs text-blue-600 mt-1">{{ pointsIssuedToday.toLocaleString() }} today</div>
        </div>

        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600">{{ averageRedemptionValue.toFixed(2) }}</div>
          <div class="text-sm text-gray-600">Avg. Redemption Value</div>
          <div class="text-xs text-purple-600 mt-1">${{ monthlyRedemptionValue.toLocaleString() }} this month</div>
        </div>
      </div>
    </div>

    <!-- Create Program Modal -->
    <ProgramCreationModal
      :is-open="showCreateProgram"
      @close="showCreateProgram = false"
      @created="handleProgramCreated"
    />

    <!-- Edit Program Modal -->
    <ProgramEditModal
      :is-open="showEditProgram"
      :program="selectedProgram"
      @close="showEditProgram = false"
      @updated="handleProgramUpdated"
    />

    <!-- Program Details Modal -->
    <ProgramDetailsModal
      :is-open="showProgramDetails"
      :program="selectedProgram"
      @close="showProgramDetails = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loyaltyService, type LoyaltyProgram } from '@/services/loyalty'
import ProgramCreationModal from './ProgramCreationModal.vue'
import ProgramEditModal from './ProgramEditModal.vue'
import ProgramDetailsModal from './ProgramDetailsModal.vue'

// State
const programs = ref<LoyaltyProgram[]>([])
const selectedProgram = ref<LoyaltyProgram | null>(null)
const showCreateProgram = ref(false)
const showEditProgram = ref(false)
const showProgramDetails = ref(false)

const totalMembers = ref(1247)
const totalPointsIssued = ref(156780)
const pointsIssuedToday = ref(2340)
const averageRedemptionValue = ref(18.75)
const monthlyRedemptionValue = ref(8947)

// Methods
const loadPrograms = async () => {
  try {
    programs.value = await loyaltyService.getAllPrograms()
  } catch (error) {
    console.error('Error loading programs:', error)
  }
}

const editProgram = (program: LoyaltyProgram) => {
  selectedProgram.value = program
  showEditProgram.value = true
}

const viewProgramDetails = (program: LoyaltyProgram) => {
  selectedProgram.value = program
  showProgramDetails.value = true
}

const toggleProgramStatus = async (program: LoyaltyProgram) => {
  try {
    const newStatus = !program.isActive
    const updatedProgram = await loyaltyService.updateProgram(program.id, {
      isActive: newStatus
    })
    program.isActive = updatedProgram.isActive
  } catch (error) {
    alert('Failed to update program status')
  }
}

const handleProgramCreated = async (_programId: string) => {
  await loadPrograms()
}

const handleProgramUpdated = async (_programId: string) => {
  await loadPrograms()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadPrograms()
})
</script>
